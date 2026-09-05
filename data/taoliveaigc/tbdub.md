# TaoLiveAIGC/TBDub

## Resumen

TBDub es un sistema de doblaje visual orientado a producción desarrollado por el equipo TaoLiveAIGC del grupo Taobao & Tmall de Alibaba. Su función principal es generar movimientos de labios sincronizados con un audio de conducción sobre un vídeo fuente, preservando la identidad del hablante, los detalles faciales y la consistencia temporal. El modelo está diseñado para ser robusto en condiciones difíciles: cabezas con grandes poses, movimiento rápido, oclusión facial, audio de otro hablante y vídeos generados por AIGC.

Se trata de un modelo de difusión para generación de vídeo talking-head. La arquitectura combina componentes auxiliares como Wan, UMT5, HuBERT y DWPose, aunque la información disponible no detalla el número de parámetros ni la longitud de contexto. TBDub ofrece dos variantes de inferencia: una estándar que usa los pesos base y finetune, y otra destilada con un modelo estudiante de dos pasos para acelerar la generación.

La licencia publicada para los pesos y el código es Apache 2.0, con soporte para cinco idiomas: inglés, chino, japonés, coreano y ruso. Está concebido para aplicaciones de investigación y usos autorizados de doblaje visual, localización de vídeo, humanos digitales y animación facial por audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video talking-head; no se especifica el tipo exacto (transformer, etc.) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, chino, japones, coreano, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tbdub_base.safetensors, tbdub_finetune.safetensors, tbdub_student.safetensors) y .pt (null_prompt_emb.pt) |

## Arquitectura y entrenamiento

TBDub es un sistema de doblaje visual basado en un modelo de difusion para video talking-head. A partir de un video fuente y un audio de conduccion, genera sincronizacion de labios manteniendo la identidad del hablante, el color de los labios, la estructura dental y la textura facial. El modelo incorpora un pipeline con multiples componentes auxiliares: Wan (generacion de video), UMT5 (encoder de texto), HuBERT (encoder de audio) y DWPose (estimacion de pose), segun se indica en el repositorio oficial.

El entrenamiento no esta documentado en detalle en la informacion disponible. Se menciona que se ha disenado para preservar la identidad fina y evitar la degradacion en secuencias largas, reduciendo parpadeos e inestabilidad de iluminacion. Ademas, se ha destilado un modelo estudiante (tbdub_student) que permite inferencia en dos pasos para acelerar la generacion, frente al uso estandar que combina el checkpoint base con el finetune.

## Capacidades

- Generacion de video talking-head con movimiento de labios sincronizado al audio de conduccion.
- Preservacion de identidad de alta fidelidad: color de labios, estructura dental, textura facial y detalles finos.
- Consistencia temporal en secuencias largas, reduciendo parpadeo, iluminacion inestable y degradacion de identidad.
- Robustez ante grandes poses de cabeza, movimiento rapido, oclusion facial, audio cross-speaker y videos generados por AIGC.
- Soporte multilingue para los idiomas en, zh, ja, ko y ru.
- Modo de inferencia estandar (checkpoint base + finetune) y modo destilado (checkpoint base + student) para generacion mas rapida.
- No aplica: no es un modelo de lenguaje, por lo que no ofrece capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Doblaje de video para localizacion: se sustituye el audio original de un video por una pista en otro idioma (en, zh, ja, ko, ru) y TBDub sincroniza los labios del hablante a la nueva voz, preservando la identidad visual y reduciendo el trabajo de postproduccion.
- Humanos digitales para live commerce: el equipo desarrollador se centra en humanos digitales para ventas en directo. TBDub puede animar a un avatar o a un vendedor real con audio de conduccion para generar contenido audiovisual actualizado.
- Correccion de lip-sync en videos generados por IA: dado que soporta entradas AIGC, es capaz de corregir el movimiento de labios en videos sinteticos donde el audio y la imagen no estan alineados, mejorando la credibilidad del contenido.
- Animacion facial por audio para presentaciones y tutoriales: a partir de un video de un presentador y una nueva narracion, el modelo genera lip-sync para reutilizar el material grabado con un guion diferente.
- Postproduccion cinematografica y de television: permite doblar escenas complejas con oclusion facial, cabezas en movimiento rapido o poses extremas, donde los sistemas convencionales fallan.
- Mejora de claridad de labios y dientes en videos de baja resolucion: TBDub puede mejorar la nitidez de la boca respecto al video de entrada, aunque para videos severamente degradados se recomienda combinarlo con tecnicas de superresolucion o restauracion facial.
- Investigacion academica en doblaje visual, animacion facial por audio y humanos digitales: proporciona dos variantes de inferencia para experimentar con calidad frente a velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion publicada no especifica el consumo de memoria ni el tamano de los checkpoints.
- GPU recomendadas: no disponible. No se indica ninguna GPU concreta para los diferentes modos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: TBDub se ejecuta mediante el repositorio oficial de GitHub y el script `infer.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje sino un sistema de generacion de video.
- Latencia y throughput estimados: no disponible. No se aportan datos de rendimiento de inferencia.

## Comparativa con modelos similares

No se ha encontrado una comparativa publicada entre TBDub y otros sistemas de doblaje visual en la informacion disponible.

## Limitaciones y advertencias

- La calidad visual del video generado depende directamente de la calidad del video fuente. TBDub no puede recuperar detalles faciales de alta fidelidad a partir de videos severamente de baja resolucion; puede requerir restauracion facial o superresolucion adicional.
- La evaluacion cuantitativa actual se basa principalmente en la reconstruccion auto-dirigida (self-driven reconstruction), donde cada video se reconstruye con su audio original. Las metricas pueden no reflejar el rendimiento real en entornos cross-driven con audio desalineado o de otra identidad.
- Las metricas automaticas no siempre coinciden con la percepcion humana. Se recomienda revisar los resultados con comparaciones cualitativas antes de tomar decisiones de produccion.
- El uso previsto es para investigacion y aplicaciones autorizadas. El usuario es responsable de obtener el consentimiento adecuado y de garantizar que el contenido generado cumpla con las leyes, licencias y politicas de la plataforma aplicables.
- La licencia Apache 2.0 de los pesos y el codigo no cubre automaticamente a las dependencias de terceros ni a los checkpoints auxiliares (Wan, UMT5, HuBERT, DWPose), que siguen sujetos a sus propias licencias.

## Enlaces

- HuggingFace: https://huggingface.co/TaoLiveAIGC/TBDub
- Repositorio GitHub: https://github.com/TaoLiveAIGC/TBDub
- Perfil de GitHub de TaoLiveAIGC: https://github.com/TaoLiveAIGC/
- Perfil de HuggingFace de TaoLiveAIGC: https://huggingface.co/TaoLiveAIGC
