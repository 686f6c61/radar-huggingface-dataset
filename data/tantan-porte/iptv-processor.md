# Tantan-porte/iptv-processor

## Resumen

El repositorio `Tantan-porte/iptv-processor` alojado en HuggingFace no corresponde a un modelo de inteligencia artificial, sino a una aplicación de software para el procesamiento de listas IPTV (televisión por protocolo de internet). El autor, Tantan-porte, ha publicado una herramienta con interfaz web en árabe que permite gestionar y transformar fuentes de canales de televisión en diferentes formatos. No se trata de un modelo de lenguaje, visión u otro tipo de IA, por lo que las especificaciones técnicas habituales de un modelo (arquitectura, parámetros, contexto) no son aplicables.

La aplicación, según la model card, soporta cuatro formatos de entrada (M3U/M3U8, Xtream Codes, dirección MAC y Stalker Portal) y cinco formatos de exportación (M3U, Xtream, Enigma2, Text y CSV). Incluye además un reproductor de vídeo integrado y una interfaz oscura en árabe. Aunque el repositorio está alojado en HuggingFace, su naturaleza es completamente distinta a la de un modelo de IA, por lo que esta ficha se centrará en describir sus características como herramienta de software, indicando explícitamente los campos que no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (aplicación de software, no modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Árabe (interfaz) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no hay pesos; se distribuye como contenedor Docker) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. La aplicación está diseñada como un servicio web empaquetado en Docker (según la model card, `sdk: docker` y `app_port: 7860`). Su lógica interna se centra en el análisis y transformación de listas de reproducción IPTV, la detección automática del formato de entrada y la conversión a múltiples formatos de salida. No hay datos de entrenamiento, ni proceso de RLHF, ni innovaciones en arquitectura de redes neuronales. La herramienta probablemente utiliza bibliotecas de procesamiento de texto y protocolos de streaming, pero no se especifican detalles técnicos en la información disponible.

## Capacidades

- Detección automática del formato de entrada: M3U/M3U8, Xtream Codes, dirección MAC y Stalker Portal.
- Descarga y desglose de canales desde múltiples fuentes.
- Conversión de streaming en tiempo real entre formatos TS, HLS y DASH.
- Exportación a cinco formatos: M3U, Xtream, Enigma2, Text y CSV.
- Reproductor de vídeo integrado en la interfaz web.
- Interfaz de usuario en árabe con tema oscuro.
- No incluye capacidades de IA generativa, razonamiento, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Consolidación de listas IPTV: un usuario puede importar listas M3U de diferentes proveedores y unificarlas en un solo archivo M3U limpio, eliminando duplicados y canales muertos.
- Migración entre plataformas: si un usuario cambia de un servicio Xtream a un portal Stalker, la herramienta convierte la lista al formato adecuado sin intervención manual.
- Generación de listas para dispositivos Enigma2: los receptores de satélite con firmware Enigma2 requieren formatos específicos; esta aplicación exporta directamente a ese formato.
- Creación de archivos CSV para gestión externa: permite exportar la información de canales a una hoja de cálculo para auditoría o análisis.
- Reproducción de prueba: el reproductor integrado permite verificar que un canal funciona antes de añadirlo a la lista final.
- Automatización de actualizaciones: al ser una aplicación Docker, puede desplegarse en un servidor y programarse para refrescar listas periódicamente, aunque no se documenta esta funcionalidad explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no existen métricas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan datos de rendimiento de la aplicación (tiempos de procesamiento, uso de CPU, etc.).

## Requisitos de hardware

- Al ser una aplicación Docker, los requisitos dependen del volumen de canales a procesar. Para listas pequeñas (menos de 1000 canales), un equipo con 2 GB de RAM y un procesador básico es suficiente.
- Para listas grandes (más de 10 000 canales) o conversión de streaming en tiempo real, se recomienda al menos 4 GB de RAM y un procesador de gama media.
- No requiere GPU, ya que no hay inferencia de modelos neuronales.
- Opciones de despliegue: Docker (según la model card), posiblemente en cualquier sistema que soporte contenedores (Linux, Windows con WSL2, NAS, VPS).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No aplica, ya que no es un modelo de IA. Como herramienta de procesamiento IPTV, se puede comparar con otras utilidades de código abierto como `tuliprox` (un proxy y procesador de listas IPTV escrito en Rust) o el proyecto `iptv-org/iptv` (una colección de canales IPTV públicos). Sin embargo, estas comparaciones no son relevantes para el contexto de fichas de modelos de IA. La información disponible no permite una comparación técnica detallada.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de capacidades de lenguaje, razonamiento o generación de contenido es incorrecta.
- La licencia no está especificada, por lo que se desconoce si su uso comercial está permitido.
- La interfaz está únicamente en árabe, lo que limita su accesibilidad para otros idiomas.
- No se documentan medidas de seguridad o privacidad; al procesar listas IPTV, podría manejar datos de suscripción que deben tratarse con cuidado.
- La fecha de creación (agosto de 2026) es futura, lo que sugiere que el repositorio podría ser experimental o no verificado.
- No hay información sobre mantenimiento, soporte o comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tantan-porte/iptv-processor
- Proyecto relacionado (no afiliado): https://github.com/iptv-org/iptv (colección de canales IPTV públicos)
- Proyecto relacionado (no afiliado): https://github.com/euzu/tuliprox (procesador de listas IPTV en Rust)
