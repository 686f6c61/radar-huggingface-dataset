# visiting1453/mm2-murder-mystery-2-script-keyless

## Resumen

`visiting1453/mm2-murder-mystery-2-script-keyless` no es un modelo de inteligencia artificial. El repositorio de Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, visión o audio. Se trata de una model card que actúa como página de distribución de un supuesto ejecutable para Windows (`mm2-murder-mystery-2-script-keyless-v1.2.0-win64.exe`), empaquetado en un ZIP de 8,9 MB alojado en un repositorio de GitHub de terceros (`thomasfontana8267/mm2-murder-mystery-2-script-keyless`).

El contenido describe funcionalidades de tipo "script" o "cheat" para el videojuego Murder Mystery 2 de Roblox: server hopper de bajo ping, guardia anti-AFK, teleport por coordenadas, ESP de entidades y cofres 3D, alertas por webhook de Discord y configuración JSON persistente. Ninguna de estas funciones guarda relación con inferencia de modelos ni con aprendizaje automático. La etiqueta `license:mit` y el listado de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son metadatos declarados por el autor, no indicativos de capacidades lingüísticas de un modelo.

La relevancia técnica de esta ficha es, por tanto, negativa: sirve como ejemplo de repositorio que se hace pasar por un artefacto de Hugging Face pero que distribuye software ejecutable de procedencia no verificada, con contraseña de descompresión fija (`2026`), instrucciones para ejecutar como administrador y avisos explícitos sobre alertas de Windows Defender y SmartScreen. No debe tratarse como un modelo evaluable ni desplegarse en entornos de producción o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; no se declara arquitectura de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos declarados, sin validación) |
| Licencia | mit (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors`, `GGUF` ni ningún otro artefacto de pesos. La model card describe un supuesto ejecutable con "build `v2.6.3 (52FD86)`" y un paquete `mm2-murder-mystery-2-script-keyless-v1.2.0-win64.zip` de 8,9 MB, que por tamaño resulta incompatible con cualquier modelo neuronal mínimamente funcional.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). Los términos "arquitectura" y "módulos" que aparecen en la model card se refieren a componentes de un script de automatización de juego (server hopper, anti-AFK, ESP, teleport), no a capas o bloques de una red neuronal.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling en el sentido de APIs de modelos.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingüe real; el listado de idiomas es metadata de la model card.
- El contenido describe funcionalidades de automatización sobre el cliente de Roblox Murder Mystery 2: server hopping, anti-AFK, teleport, ESP y webhooks, sin relación con IA.

## Casos de uso

- No procede. El repositorio no contiene un modelo desplegable, por lo que no existen casos de uso legítimos de inferencia, generación o análisis.
- Auditoría de seguridad: un equipo de seguridad puede usar esta ficha como referencia para identificar repositorios de Hugging Face que distribuyen ejecutables de terceros y advertir a los usuarios.
- Formación en higiene de cadena de suministro: sirve como caso de estudio de model cards que imitan el formato de Hugging Face para distribuir binarios con contraseña fija y ejecución como administrador.
- Monitorización de repositorios: los equipos de plataforma pueden usar patrones como este (tags `windows`, `x64`, `portable`, enlaces a releases externos) para construir reglas de detección.
- No se recomienda su uso para atención al cliente, generación de código, análisis de datos, agentes ni ninguna otra aplicación de IA.
- No se recomienda su descarga ni ejecución en entornos corporativos, de investigación o personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras que aparecen en la model card (rating 4,8/5, 193K+ descargas, 99,6 % de consistencia, 364 Hz de polling, < 22 ms de respuesta) son afirmaciones de marketing sin metodología ni reproducibilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA que cargar).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10/11 64-bit, procesadores Intel o AMD x64, ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables porque el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o audio sería categorialmente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni configuración de inferencia.
- Distribución de un ejecutable de procedencia no verificada alojado en un repositorio de GitHub de terceros, no en Hugging Face.
- Contraseña de descompresión fija (`2026`) e instrucciones para ejecutar como administrador, patrón habitual en campañas de distribución de malware.
- La model card incluye avisos sobre alertas de Windows Defender y SmartScreen, lo que sugiere detecciones de seguridad previas.
- Riesgo elevado de phishing, robo de credenciales de Roblox o Discord, mineros o troyanos.
- La licencia MIT declarada no aporta ninguna garantía sobre el binario distribuido.
- El listado de idiomas y los tags no implican capacidades reales del artefacto.
- Uso comercial: desaconsejado; no hay soporte, mantenimiento ni trazabilidad.
- Posible incumplimiento de los términos de servicio de Roblox y de la legislación aplicable sobre trampas en videojuegos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/visiting1453/mm2-murder-mystery-2-script-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/thomasfontana8267/mm2-murder-mystery-2-script-keyless
- Releases del repositorio de GitHub: https://github.com/thomasfontana8267/mm2-murder-mystery-2-script-keyless/releases/latest
- Paquete ZIP referenciado: https://github.com/thomasfontana8267/mm2-murder-mystery-2-script-keyless/releases/latest/download/mm2-murder-mystery-2-script-keyless-v1.2.0-win64.zip
