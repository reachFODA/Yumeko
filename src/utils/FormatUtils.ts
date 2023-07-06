import { Guild } from "discord.js";

interface TimeFormat {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }

export class FormatUtils {

    public static roleMention(guild: Guild, discordId: string): string {
        if (discordId === '@here') {
            return discordId;
        }

        if (discordId === guild.id) {
            return '@everyone';
        }

        return `<@&${discordId}>`;
    }

    public static channelMention(discordId: string): string {
        return `<#${discordId}>`;
    }

    public static userMention(discordId: string): string {
        return `<@!${discordId}>`;
    }

    public static FormatNumber(number: number): string {
      return number.toLocaleString('pt-BR');
    }
      
    public static formatTime(ms: number): TimeFormat {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
      
        return {
          days,
          hours: hours % 24,
          minutes: minutes % 60,
          seconds: seconds % 60,
        };
      }
    
}