# zanezhang666/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una version "abliterada" (sin rechazos) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario zanezhang666 en Hugging Face y atribuida en la model card al autor HauhauCS. El modelo base es un transformer MoE de 34.660.610.688 parametros totales (unos 35B) con aproximadamente 3B parametros activos por token, 256 expertos con 8 enrutados por token, 40 capas y una arquitectura hibrida que combina atencion lineal con atencion softmax completa en proporcion 3:1. Es nativamente multimodal (texto, imagen y video) y esta disenado para conversacion y tareas image-text-to-text.

La modificacion principal respecto al original es la eliminacion de los mecanismos de rechazo: la model card afirma "0/465 refusals" en la variante Aggressive, manteniendo intactos datasets y capacidades del modelo base. Se distribuye exclusivamente en formato GGUF con cuantizaciones generadas mediante importance matrix (imatrix), incluyendo las cuantizaciones propietarias K_P ("Perfect") del autor, ademas de un fichero `mmproj` en f16 necesario para el procesamiento de vision.

Su relevancia practica radica en que ofrece un modelo MoE multimodal de 35B con contexto nativo de 262K tokens ejecutable en hardware de consumo mediante cuantizaciones de 11 a 44 GB, bajo licencia Apache 2.0, con soporte para llama.cpp, LM Studio y runtimes compatibles con GGUF. Es una opcion orientada a desarrolladores que necesitan un modelo sin filtros de contenido y con capacidad de razonamiento, codigo y vision, asumiendo las implicaciones eticas y de cumplimiento que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida (linear attention + full softmax attention, ratio 3:1) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por forward pass |
| Longitud de contexto | 262K tokens nativos (recomendado mantener >=128K para preservar thinking) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; mmproj f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj f16 para vision) |
| Expertos | 256 totales, 8 enrutados por token |
| Capas | 40 |
| Modalidades | Texto, imagen, video |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer de mezcla de expertos (MoE) con 256 expertos y 8 enrutados por token, lo que da lugar a unos 3B parametros activos sobre un total de ~35B. La innovacion estructural mas destacable es su caracter hibrido: combina capas de atencion lineal con capas de atencion softmax completa en una proporcion 3:1, lo que reduce el coste computacional y de memoria en contextos largos frente a un transformer denso equivalente. Consta de 40 capas y soporta 262K tokens de contexto nativo. Es nativamente multimodal, procesando texto, imagen y video a traves del fichero `mmproj` en despliegues GGUF.

La model card indica explicitamente que "no hay cambios en datasets ni capacidades" respecto al modelo base: se trata de un proceso de abliteracion (eliminacion de direcciones de rechazo en los pesos) sin reentrenamiento adicional documentado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Las cuantizaciones se generaron con importance matrix para preservar la calidad sobre los pesos abliterados, y las variantes K_P aplican un perfil de cuantizacion especifico del modelo que, segun el autor, mejora la calidad en 1-2 niveles a cambio de un 5-15% mas de tamano.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento en modo thinking (activado por defecto) y modo no-thinking, con hiperparametros de muestreo recomendados distintos para cada uno.
- Generacion y comprension de codigo, con ajustes de temperatura recomendados para tareas de coding.
- Razonamiento matematico y tareas de precision.
- Vision multimodal: comprension de imagenes y video mediante el fichero `mmproj`.
- Capacidades multilingues, con foco en ingles y chino y soporte declarado de otros idiomas.
- Operacion sin rechazos en la variante Aggressive (0/465 refusals segun el autor), aunque puede anadir breves avisos heredados del entrenamiento del modelo base sin bloquear la generacion.
- Compatibilidad con llama.cpp, LM Studio y runtimes GGUF (requiere flag `--jinja` en llama.cpp para el chat template).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada de forma explicita para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: gestion de dialogos multi-turno con documentos extensos gracias a los 262K tokens de contexto nativo, util para analisis de contratos, informes o bases de codigo completas en una sola ventana.
- Procesamiento de documentacion tecnica con imagenes: extraccion y razonamiento sobre diagramas, capturas de pantalla y figuras combinando el modo texto e imagen, adecuado para soporte tecnico y documentacion de producto.
- Analisis de video: descripcion y extraccion de informacion de clips mediante la entrada multimodal, aplicable a catalogacion de contenido audiovisual o moderacion asistida.
- Generacion de codigo en pipelines locales: con cuantizaciones Q4_K_M de 21 GB puede ejecutarse en una unica GPU de 24 GB, integrándose en entornos de desarrollo sin dependencia de la nube.
- Investigacion sobre alineacion y seguridad: la variante sin rechazos sirve como objeto de estudio para medir comportamientos del modelo base frente a su version abliterada, comparando tasas de rechazo y calidad.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo adulto donde los filtros del modelo original interferirian, en entornos controlados y con las salvaguardas legales oportunas.
- Despliegue en hardware de consumo: con la cuantizacion IQ2_M de 11 GB cabe en GPUs de 12-16 GB, permitiendo prototipado local de un modelo MoE de 35B con vision.
- Traduccion y procesamiento multilingue EN/ZH: tareas de traduccion y resumen entre ingles y chino con contexto amplio para documentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero GGUF): IQ2_M ~11 GB, Q2_K_P ~15 GB, IQ3_M ~15 GB, Q3_K_P ~19 GB, IQ4_XS ~19 GB, IQ4_NL ~20 GB, Q4_K_M ~21 GB, Q4_K_P ~23 GB, Q5_K_P ~28 GB, Q6_K_P ~31 GB, Q8_K_P ~44 GB. Anadir ~899 MB para el fichero `mmproj` f16 si se usa vision, mas el espacio de cache KV correspondiente al contexto configurado.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o inferiores; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q6/Q8 y contextos largos; configuraciones multi-GPU para Q8_K_P con contexto de 128K o superior.
- Cabe en GPU de consumo: si, desde GPUs de 12-16 GB con IQ2_M/IQ3_M, y de forma holgada en 24 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp (requiere flag `--jinja`), LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3B parametros activos, el coste por token es inferior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B (MoE) | ~3B | 262K | Texto, imagen, video | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | ~3B | 262K | Texto, imagen, video | Apache 2.0 | safetensors (original) |
| Alternativas de mismo tamano y categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base Qwen/Qwen3.6-35B-A3B, del que esta variante solo difiere en la eliminacion de rechazos y en el formato de distribucion (GGUF cuantizado frente a pesos completos). No se dispone en la informacion proporcionada de datos de rendimiento comparado con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: la variante Aggressive no rechaza peticiones, lo que implica riesgo de generar contenido danino, ilegal o desinformacion. No es apta para despliegues publicos sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta variante; la abliteracion puede alterar calibracion del modelo base.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.6-35B-A3B, no especificados.
- Avisos residuales: la model card advierte de que el modelo puede anadir breves disclaimers heredados del entrenamiento base, aunque el contenido completo se genera igualmente.
- Contexto: se recomienda mantener al menos 128K tokens para preservar las capacidades de thinking; reducir el contexto por debajo de ese umbral puede degradar el razonamiento.
- Idiomas: el soporte declarado se centra en ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin filtros recae integramente en el desplegador.
- Formato: solo se distribuye en GGUF; no hay pesos safetensors de esta variante, lo que limita el uso con frameworks que no soporten GGUF (por ejemplo, entrenamiento o fine-tuning directo).
- Cuantizaciones K_P: pueden mostrarse como "?" en la columna de cuantizacion de LM Studio (problema solo de visualizacion); el widget de compatibilidad de hardware de Hugging Face no reconoce estas cuantizaciones y puede ocultar ficheros.
- Repositorio: 247.4 GB de tamano total, con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zanezhang666/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Repositorio del autor de la abliteracion (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discord del autor: https://discord.gg/SZ5vacTXYf
