# WoofyLemo/VoxSRT-qwen3-asr-1.7b-with-aligner

## Resumen

VoxSRT-qwen3-asr-1.7b-with-aligner es un paquete de datos de modelo preparado para su uso local en la aplicación VoxSRT, una herramienta de subtitulado y transcripción. El repositorio no contiene un modelo entrenado de nuevo, sino dos instantáneas oficiales inmutables de modelos de Alibaba: Qwen3-ASR-1.7B (reconocimiento automático de voz) y Qwen3-ForcedAligner-0.6B (alineación forzada de voz). VoxSRT actúa como distribuidor de estos pesos, verificando su integridad mediante SHA-256, sin realizar ningún entrenamiento, fine-tuning o fusión adicional.

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento de voz de última generación que soporta identificación de idioma y ASR para 52 lenguas y dialectos, combinando un codificador de audio estilo Whisper con un decodificador de lenguaje Qwen3. El paquete incluye además el alineador forzado no autorregresivo de 0.6B, lo que permite tareas de alineación temporal precisa entre audio y texto. Su relevancia actual radica en ofrecer una solución de transcripción y subtitulado completamente local, sin envío de datos a servidores externos, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + decodificador Qwen3 (para ASR); alineador forzado no autorregresivo (para el componente de 0.6B) |
| Parametros totales | 1.7B (ASR) + 0.6B (alineador) = 2.3B combinados |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en formato safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | 52 lenguas y dialectos (segun documentacion de Qwen3-ASR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

El paquete combina dos modelos oficiales de Alibaba. Qwen3-ASR-1.7B sigue la arquitectura de la familia Qwen3-ASR: un codificador de audio basado en el enfoque de Whisper (con atencion sobre espectrogramas o features de audio) acoplado a un decodificador de lenguaje Qwen3, lo que permite un procesamiento de voz a texto con capacidades de razonamiento del modelo de lenguaje subyacente. El modelo fue entrenado con grandes volumenes de datos de habla multilingue y aprovecha las capacidades de comprension de audio del modelo fundacional Qwen3-Omni. El segundo componente, Qwen3-ForcedAligner-0.6B, es un modelo no autorregresivo especificamente disenado para alineacion forzada, es decir, determinar los limites temporales de cada palabra o fonema en un audio dado su transcripcion.

No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio de VoxSRT no incluye ningun proceso de entrenamiento adicional; los pesos son copias exactas de las versiones oficiales publicadas por Qwen.

## Capacidades

- Transcripcion de voz a texto en 52 lenguas y dialectos, con identificacion automatica de idioma.
- Alineacion forzada de audio y texto mediante el modelo de 0.6B, util para subtitulado sincronizado.
- Procesamiento local completo: el paquete esta disenado para inferencia en la aplicacion VoxSRT sin envio de datos a servidores externos.
- Soporte de subtitulado, correccion de fuentes y traduccion (segun la descripcion de VoxSRT).
- Compatible con el ecosistema transformers de HuggingFace (libreria transformers).
- No se mencionan capacidades de tool calling, agentes, vision ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Subtitulado automatico de videos locales: VoxSRT utiliza el modelo para transcribir el audio de un video y generar subtitulos sincronizados, aprovechando el alineador forzado para ajustar los tiempos de cada linea.
- Transcripcion de reuniones o entrevistas: el modelo ASR de 1.7B puede convertir grabaciones de audio en texto con alta precision multilingue, ideal para actas o notas.
- Correccion de subtitulos existentes: la combinacion de ASR y alineador permite comparar una transcripcion previa con el audio y corregir errores de sincronizacion o de contenido.
- Traduccion de contenido audiovisual: aunque no se especifica un modulo de traduccion propio, la integracion con VoxSRT sugiere flujos donde la transcripcion local se combina con servicios de traduccion posteriores.
- Archivado y busqueda de contenido hablado: al generar transcripciones locales, se pueden indexar y buscar dentro de archivos de audio o video sin depender de servicios en la nube.
- Desarrollo de herramientas de accesibilidad: la transcripcion y alineacion local permite crear aplicaciones de subtitulado en tiempo real o diferido para personas con discapacidad auditiva, manteniendo la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de VoxSRT no incluye metricas de rendimiento, y la documentacion de Qwen3-ASR menciona que la version de 1.7B alcanza un rendimiento de ultima generacion entre los modelos ASR de codigo abierto, pero no se proporcionan cifras concretas en los resultados de busqueda obtenidos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 2.3B parametros combinados en precision FP16, se estima un consumo de aproximadamente 4.6 GB solo para los pesos, mas overhead de activaciones y atencion. En cuantizacion INT8 podria reducirse a unos 2.5-3 GB, pero no se ofrecen cuantizaciones precalculadas en el repositorio.
- GPU recomendadas: no se especifican. Por el tamano, una GPU consumer con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) podria ejecutar el modelo en FP16 con optimizaciones, aunque para contextos largos o lotes grandes se recomendaria una GPU de 12-16 GB (RTX 4070, RTX 4080, etc.).
- Si cabe en consumer GPU: probablemente si, en GPUs de gama media-alta con al menos 8 GB de VRAM, especialmente con cuantizacion o usando tecnicas de offloading.
- Opciones de despliegue: el paquete esta disenado para VoxSRT, pero al ser modelos transformers estandar, pueden cargarse con la libreria transformers de HuggingFace, vLLM, TGI u otros frameworks compatibles. Para el alineador forzado, se requeriria una implementacion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con alternativas. El modelo base Qwen3-ASR-1.7B compite con otros ASR multilingues como Whisper-large-v3 (1.5B parametros) o SeamlessM4T, pero no se han encontrado datos comparativos en la informacion proporcionada. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- El repositorio es un paquete de datos para VoxSRT, no un modelo independiente con interfaz de inferencia propia. Su uso fuera de VoxSRT requiere cargar los pesos manualmente.
- No se incluyen cuantizaciones precalculadas; el usuario debe aplicar su propia cuantizacion si necesita reducir el consumo de memoria.
- La informacion sobre idiomas soportados proviene de la documentacion de Qwen3-ASR, pero no se detalla la cobertura exacta ni la calidad por idioma.
- No se han publicado resultados de benchmarks en este repositorio, por lo que el rendimiento real en tareas especificas no esta verificado.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia de los modelos base originales (Qwen3-ASR y Qwen3-ForcedAligner) para confirmar que no existen restricciones adicionales.
- El paquete no incluye codigo ejecutable; VoxSRT es el unico entorno de ejecucion previsto, y no se garantiza compatibilidad con otros sistemas operativos o plataformas.
- La verificacion de integridad (SHA-256) no garantiza la calidad del modelo ni su idoneidad para casos de uso especificos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WoofyLemo/VoxSRT-qwen3-asr-1.7b-with-aligner
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico de Qwen3-ASR (arXiv): https://arxiv.org/html/2601.21337
- Documentacion de transformers para Qwen3 ASR: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr
- Demo oficial de Qwen3-ASR en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-ASR
