# tencent/Hy4-flash-base

## Resumen

Hy4-flash-base es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Tencent, publicado en Hugging Face bajo la licencia Tencent Hy License. Es la variante "flash" de la familia Hy4 y se posiciona como la opción mas coste-eficiente de dicha familia: cuenta con 219.405.515.525 parametros totales en safetensors (220B segun la model card, de los cuales 63,5B corresponden a los embeddings N-gram "Engram") y activa unicamente unos 11,3B de parametros de texto mas 0,43B de vision por token. Acepta de forma nativa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

La arquitectura combina un backbone de 42 capas (1 capa densa y 41 capas MoE) con atencion hibrida que intercala atencion dispersa (IndexPool) y atencion de ventana deslizante (SWA) en proporcion 1:3, todo sobre Multi-head Latent Attention (MLA). Incluye un encoder visual adaptado de SigLIP2-So400m-Patch16-Res512 conectado mediante un proyector MLP, y un drafter integrado de 5 capas y 0,85B parametros (DFly2) para decodificacion especulativa en contexto largo.

Su relevancia actual radica en la combinacion de un contexto extremadamente largo (1M tokens), naturaleza multimodal y un coste de inferencia reducido gracias a la activacion dispersa de expertos, lo que lo hace atractivo para despliegues de agentes y procesamiento de documentos extensos. La model card publicada corresponde al checkpoint base (pretrained), no a una version afinada para instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (dispersa + ventana deslizante) sobre MLA |
| Parametros totales | 219.405.515.525 (safetensors); 155,5B excluyendo Engram, ViT y DFly2; 63,5B Engram; 0,43B ViT; 0,85B DFly2 |
| Parametros activos | 11,3B texto + 0,43B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No especificados en la informacion disponible; existe un repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El backbone del lenguaje tiene 42 capas: una capa densa con FFN de tamano intermedio 13.824 y 41 capas MoE. Cada capa MoE contiene 512 expertos enrutados y un experto compartido; por token se activan 16 expertos enrutados. Los expertos operan en un espacio latente de dimension 1.536 (LatentMoE), con tamano intermedio de experto tambien de 1.536. El tamano oculto es de 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atencion es hibrida: el patron de capas es 2 dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa), resultando en 12 capas de atencion dispersa y 30 de ventana deslizante. Ambas usan Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512, dimension de cabeza QK de 192 + 64 (no-RoPE + RoPE) y dimension de cabeza de valor de 256. Las capas dispersas usan RoPE base 10.000.000 y seleccion de contexto de hasta 2.048 tokens mediante seleccion a nivel de grupo; las capas SWA usan RoPE base 10.000 y ventana causal de 512 tokens. La codificacion posicional multimodal es MRoPE intercalado.

El modelo incorpora embeddings N-gram (Engram): representaciones aprendidas de bigramas y trigramas recuperadas mediante búsquedas hash multi-cabeza en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza y dimension de embedding de 768 por orden (8 cabezas x 96 dimensiones), sumando 63,4B parametros en tablas de embedding. El encoder visual tiene 27 capas, tamano oculto 1.152, intermedio 4.304, 16 cabezas de atencion, patch de 16x16, embedding posicional de 128x128 y fusion de caracteristicas visuales 2x2. El drafter DFly2 (5 capas, 0,85B) reutiliza la cache KV y los indices dispersos del modelo objetivo para decodificacion especulativa de coste constante en contexto largo. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento sobre entradas de texto.
- Comprension de imagenes y respuesta en texto (pipeline image-text-to-text) mediante encoder SigLIP2 adaptado.
- Contexto largo de hasta 1M tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificacion especulativa integrada mediante el drafter DFly2, orientada a contexto largo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona validacion interna en tareas de codigo y agente (BPB), pero no se detallan capacidades explicitas de agentes.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.
- Al ser un checkpoint base (pretrained), no se garantiza el seguimiento de instrucciones sin ajuste posterior.

## Casos de uso

- Procesamiento de documentos extensos: con 1M tokens de contexto, el modelo puede ingerir informes, expedientes o bases de codigo completas en una sola pasada sin fragmentacion, lo que simplifica pipelines de analisis y extraccion.
- Analisis de imagenes con descripcion textual: gracias al encoder visual SigLIP2, puede emplearse en tareas de captioning, extraccion de informacion de capturas o interpretacion de graficos dentro de flujos documentales.
- Base para ajuste fino supervisado: al ser un checkpoint pretrained, sirve como punto de partida para SFT y DPO orientados a dominios concretos (legal, medico, financiero) antes de desplegarlo en produccion.
- Investigacion sobre eficiencia MoE: su combinacion de LatentMoE, atencion hibrida y Engram lo convierte en un objeto de estudio para experimentos de escalado disperso y comparativas de coste por token.
- Despliegue de bajo coste por token: con 11,3B parametros activos de texto, es adecuado para servicios de generacion donde el coste de inferencia por peticion es critico, sirviendose de vLLM o SGLang.
- Evaluacion de decodificacion especulativa: el drafter DFly2 permite medir ganancias de latencia en generacion de contexto largo reutilizando cache KV e indices dispersos.
- Prototipado multimodal en investigación: util para experimentos que requieran alternar texto e imagen con contexto muy largo, como analisis de series de documentos escaneados con anotaciones.

## Benchmarks y rendimiento

La model card menciona resultados de bits-per-byte (BPB) en validacion interna de codigo y agente (menor es mejor), pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 219,4B parametros totales en safetensors, la carga en precision completa (BF16) requiere aproximadamente 439 GB de VRAM, lo que exige multiples GPUs. En cuantizacion de 8 bits se estiman unos 220 GB, y en 4 bits unos 110 GB, aunque no se confirman estos valores en la informacion disponible.
- GPU recomendadas: para precision completa, nodos multi-GPU con A100 80GB o H100 80GB (al menos 6 unidades en BF16). Para cuantizaciones agresivas, posibles configuraciones con 2-4 GPUs de 80GB.
- Viabilidad en GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) en precision completa ni en cuantizaciones moderadas; solo seria viable con cuantizaciones muy agresivas y offloading, no documentado.
- Opciones de despliegue: transformers, vLLM, SGLang (mencionados en la model card), API compatible con OpenAI, y llama.cpp/Ollama a traves del repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la decodificacion especulativa con DFly2 esta disenada para reducir latencia en contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4-flash-base (Tencent) | 219,4B (155,5B sin Engram/ViT/DFly2) | 11,3B + 0,43B vision | 1M | Tencent Hy License | Multimodal, MoE, atencion hibrida, DFly2 |
| Hy4 (Tencent) | No disponible | No disponible | No disponible | Tencent Hy License | Referencia citada en la model card como predecesor |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Es un checkpoint base (pretrained): no esta afinado para seguir instrucciones ni para conversacion, por lo que su uso directo en produccion requiere ajuste posterior.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos web es probable que herede sesgos, pero no se aportan detalles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto.
- Idiomas soportados: no especificados; el rendimiento fuera de los idiomas principales de entrenamiento es incierto.
- Restricciones de licencia: la Tencent Hy License (license: other) puede imponer condiciones adicionales para uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegarlo.
- Requisitos de hardware muy elevados: 219,4B parametros totales implican infraestructura multi-GPU para inferencia en precision completa.
- El contexto de 1M tokens puede degradar la calidad en tareas que requieran atencion precisa a fragmentos muy alejados, aunque no se aportan datos al respecto.
- La licencia y los terminos de uso de los pesos GGUF de terceros pueden diferir de los del repositorio oficial.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-flash-base
- Modelo de referencia Hy4-flash: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash-base/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash-base/blob/main/README_CN.md
- Sitio oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
