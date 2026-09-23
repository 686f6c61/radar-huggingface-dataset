# VitreousCut/MiMo-V2.6-Distill-Qwen-9B-Q4_K_M-MTP-GGUF

## Resumen

Este repositorio publica `MiMo-V2.6-Distill-Qwen-9B-Q4_K_M-MTP.gguf` (~5,7 GiB), una conversión a GGUF en cuantización Q4_K_M del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (Xiaomi MiMo, 9.197.093.888 parámetros) a la que el autor, VitreousCut, ha añadido un cabezal de predicción multi-token (MTP) entrenado expresamente para decodificación especulativa. El modelo base es una destilación sobre Qwen/Qwen3.5-9B orientada a tareas de agente, con foco declarado en codificación, tareas generales de agente, codificación visual y ciberseguridad, y admite entrada de imagen mediante un proyector multimodal (`mmproj`) distribuido en el repositorio de bartowski.

La relevancia de esta ficha está en que el modelo base declara el campo de configuración `mtp_num_hidden_layers: 1` pero no incluye pesos MTP. Este repositorio los entrena (~32,7 M de tokens, pérdida de 1,7 a 0,5) y los fusiona como bloque 32, de modo que el modelo puede generar borradores contra sí mismo sin un segundo modelo auxiliar. En una RTX 4090 con llama.cpp (fork prism) y `--spec-type draft-mtp`, la decodificación codiciosa repetitiva pasa de 135,6 a 215,7 t/s (1,59×) con una tasa de aceptación del 85,1 %.

Se trata de una publicación comunitaria, con 0 descargas y 0 me gusta registrados, licencia MIT y un único archivo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5; los metadatos distinguen `block_count` y `attention_count` y mantienen una lista `recurrent_layers`, lo que apunta a una arquitectura híbrida con capas recurrentes y capas de atención completa |
| Parametros totales | 9.197.093.888 (~9,2 B) en el modelo base; el cabezal MTP añade 243,3 M. Una fuente externa cita 9,4 B |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (troncal), Q8_0 (pesos lineales del cabezal MTP), F32 (normalizaciones 1-D), F16/BF16 (`mmproj` multimodal, en el repositorio de bartowski) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |
| Tamano del repositorio | 6,1 GB |
| Capas | 33 bloques (32 del troncal + 1 capa MTP de atención completa), `nextn_predict_layers = 1` |

## Arquitectura y entrenamiento

El troncal corresponde a MiMo-V2.6-Distill-Qwen-9B, un modelo denso de 9,2 B derivado de Qwen3.5-9B que Xiaomi MiMo sometió a destilación y ajuste supervisado (SFT) con datasets generados por MiMo, cubriendo cuatro dominios: codificación, tareas generales de agente, codificación visual y ciberseguridad. Xiaomi ha publicado además los pesos y el informe técnico de las variantes Pro y Flash, junto con recursos de investigación en aprendizaje por refuerzo. Los metadatos del GGUF mantienen una lista `recurrent_layers` y diferencian `block_count` de `attention_count`, lo que indica una arquitectura híbrida con capas recurrentes y capas de atención completa; la capa MTP añadida es de atención completa y se marca como `False` en `recurrent_layers`.

La innovación de este repositorio es el cabezal MTP. Sus pesos se inicializan desde los tensores `mtp.*` de Qwen/Qwen3.5-9B (misma arquitectura, verificada campo por campo) y se ajustan en dos fases: primero con caché de `h` del modelo objetivo congelado y después solo el cabezal, sobre aproximadamente 32,7 M de tokens, reduciendo la pérdida de 1,7 a 0,5. El resultado se fusiona como bloque 32 (`blk.32.*`) con pesos lineales en Q8_0 y normas en F32, mientras el troncal Q4_K_M se preserva byte a byte desde el GGUF de bartowski. Los metadatos se ajustan en consecuencia: `qwen35.block_count` y `attention_count` pasan de 32 a 33, `nextn_predict_layers = 1` y `recurrent_layers` se extiende con `False`.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla aplicada mediante `--jinja`.
- Razonamiento orientado a tareas de agente, según los dominios objetivo declarados por Xiaomi MiMo.
- Generación y asistencia en codificación, uno de los cuatro dominios de entrenamiento del modelo base.
- Codificación visual: el modelo base admite entrada de imagen y el repositorio de bartowski incluye los proyectores `mmproj-MiMo-V2.6-Distill-Qwen-9B-bf16.gguf` y `mmproj-MiMo-V2.6-Distill-Qwen-9B-f16.gguf` compatibles con cualquier cuantización.
- Tareas de ciberseguridad, cuarto dominio declarado del ajuste del modelo base.
- Decodificación especulativa autocontenida: el cabezal MTP permite generar borradores contra el propio modelo, sin un segundo modelo borrador ni configuración adicional de memoria.
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`.
- Soporte explícito de `tool calling` o `function calling`: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: con `llama-server`, `-ngl 99`, `-fa on` y `--jinja` se puede servir un chat multi-turno en una GPU de consumo, manteniendo el troncal en Q4_K_M y aprovechando el cabezal MTP para acelerar las respuestas.
- Autocompletado de código de baja latencia: el escenario con mayor ganancia medida es la decodificación codiciosa repetitiva (85,1 % de aceptación, 1,59× de aceleración), que es exactamente el patrón de un completado en editor o en generación de fragmentos predecibles.
- Agentes multi-paso: el modelo base está entrenado para tareas generales de agente, por lo que encaja en bucles de razonamiento encadenado donde cada paso es una llamada corta y determinista al modelo.
- Análisis de interfaces y capturas de pantalla: cargando el `mmproj` correspondiente en llama.cpp se habilita entrada de imagen, útil para describir UIs, extraer texto de capturas o revisar maquetas.
- Triaje en ciberseguridad: clasificación y resumen de alertas, explicación de hallazgos y generación de borradores de informes sobre logs, aprovechando el dominio de ciberseguridad del ajuste del modelo base.
- Generación de código en canalizaciones de CI/CD: ejecución local sin dependencia de APIs externas, con licencia MIT y pesos descargables, para generar parches, mensajes de commit o pruebas a partir de un diff.
- Procesamiento por lotes en GPU única: al no necesitar un segundo modelo borrador, el consumo de VRAM permanece estable, lo que simplifica el despliegue de trabajos de resumen o extracción a gran escala.
- Investigación sobre decodificación especulativa: la receta de reentrenamiento del cabezal está documentada (dos fases, inicialización desde Qwen3.5-9B, correcciones de conversión de normas), lo que permite reproducirla sobre otros troncales Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son mediciones de velocidad de inferencia de la decodificación especulativa con el cabezal MTP, realizadas en una RTX 4090 con `-fa on -ngl 99`:

| Escenario | Tasa de aceptacion | Borrador medio | t/s con spec | t/s sin spec | Aceleracion |
|---|---|---|---|---|---|
| Texto repetitivo, greedy (256 tokens) | 85,1 % (160/188) | 2,70 | 215,7 | 135,6 | 1,59× |
| Texto natural, temperatura 0,4 (96 tokens) | 38,0 % (41/108) | 1,76 | 148,9 | 132,3 | 1,13× |

El autor reporta además una comprobación de paridad offline: la probabilidad top-1 de la propuesta del cabezal coincide con una réplica en PyTorch puro del grafo de ejecución hasta tres decimales (por ejemplo, ` jumps` con p = 0,987 en vivo frente a 0,988 offline).

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa ~5,7 GiB; con caché KV y contexto corto (4.096 tokens en el ejemplo del autor) la huella total se sitúa en el entorno de 7-8 GB. Es una estimación derivada del tamaño del fichero, no una medición publicada.
- GPU medidas: RTX 4090, con 215,7 t/s en greedy con especulación activada y 135,6 t/s con especulación desactivada.
- GPU de consumo: el modelo cabe en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). No hay mediciones publicadas en la información disponible para otras GPU distintas de la RTX 4090.
- Opciones de despliegue: `llama.cpp` y `llama-server`. Para aprovechar el cabezal MTP se necesita una compilación con el grafo Qwen3.5 MTP (`graph_mtp`) y el tipo `--spec-type draft-mtp`, disponible en los forks prism/prism-ML. Una compilación estándar carga el archivo correctamente pero no ofrece especulación MTP; la generación sigue funcionando porque el troncal es un Q4_K_M ordinario.
- Comando de referencia: `llama-server -m MiMo-V2.6-Distill-Qwen-9B-Q4_K_M-MTP.gguf --spec-type draft-mtp --spec-draft-n-max 2 -ngl 99 -fa on -c 4096 --jinja`.
- vLLM, Ollama, TGI u otros motores: no se mencionan en la información proporcionada.
- Latencia y throughput: 215,7 t/s (greedy especulativo) y 148,9 t/s (temperatura 0,4) en RTX 4090, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Decodificacion especulativa | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (Q4_K_M + MTP) | 9,2 B + 243,3 M | GGUF Q4_K_M | No disponible | Sí, cabezal MTP propio | MIT | 1,59× medido en greedy; requiere fork con `graph_mtp` |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9.197.093.888 | safetensors | No disponible | No: la configuración declara `mtp_num_hidden_layers` pero sin pesos | MIT | Modelo base sin cuantizar |
| bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF Q4_K_M | 9,2 B | GGUF Q4_K_M | No disponible | No | MIT (heredada del base) | Incluye ficheros `mmproj` multimodales |
| Qwen/Qwen3.5-9B | No disponible | safetensors | No disponible | No disponible | No disponible | Origen de los tensores `mtp.*` usados para inicializar el cabezal |

## Limitaciones y advertencias

- La ganancia de la decodificación especulativa depende de la temperatura: 1,59× en greedy repetitivo frente a 1,13× en texto natural a temperatura 0,4. A temperaturas más altas la ventaja tiende al punto de equilibrio.
- Requiere un fork específico de llama.cpp (prism/prism-ML) con el grafo `graph_mtp`; el `--spec-type draft-mtp` no existe en compilaciones estándar. Sin él, el modelo funciona pero pierde toda la ventaja del cabezal.
- Al re-fusionar un cabezal propio hay tres trampas documentadas por el autor: las normas 1-D deben escribirse como `w + 1.0` (el convertidor oficial aplica el `+1` de `Qwen3_5RMSNorm`), deben almacenarse en F32 para evitar un fallo de tipos en `mul`, y hay que extender `recurrent_layers` con `False` y fijar `nextn_predict_layers = 1` con prefijo de arquitectura. Un error en el primer punto deja la tasa de aceptación en 0,00000 sin que nada más parezca roto.
- El repositorio no incluye los ficheros `mmproj`, por lo que la capacidad de visión requiere descargarlos por separado desde el repositorio de bartowski.
- No se han publicado evaluaciones de capacidades (razonamiento, código, matemáticas), ni datos de sesgo, alucinación o comportamiento multilingüe. El modelo base declara un enfoque de agente y cuatro dominios, pero sin métricas públicas asociadas.
- No se especifica la longitud de contexto soportada. El valor `-c 4096` que aparece en el ejemplo de uso es una elección de ejecución del autor, no el máximo del modelo.
- Discrepancia en el recuento de parámetros: los metadatos de HuggingFace dan 9.197.093.888 (~9,2 B) mientras que una fuente externa cita 9,4 B.
- La licencia declarada es MIT, igual que la del modelo base. No obstante, los pesos de inicialización del cabezal MTP provienen de Qwen/Qwen3.5-9B cuya licencia no se indica en la información disponible; conviene verificarla antes de un uso comercial.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo base en safetensors, no cuantificada en la documentación aportada.
- Repositorio con 0 descargas y 0 me gusta: no hay validación comunitaria ni informes de terceros sobre su comportamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/VitreousCut/MiMo-V2.6-Distill-Qwen-9B-Q4_K_M-MTP-GGUF
- Modelo base (XiaomiMiMo): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- GGUF base de bartowski: https://huggingface.co/bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF
- README del GGUF de bartowski: https://huggingface.co/bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF/blob/main/README.md
- Pesos de inicialización MTP (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Anuncio de la serie MiMo-V2.6 (Xiaomi): https://mimo.mi.com/docs/en-US/news/latest/v2-6
- Cobertura del lanzamiento del GGUF: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
- Ficha técnica del modelo base: https://www.gradually.ai/en/ai-models/mimo-v2.6-distill-qwen-9b/
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
