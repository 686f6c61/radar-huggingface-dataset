# XOTaiChi/grpo_llama3_0204

## Resumen

Llama-CBC-3.1-8B-Instruct es un ajuste fino de meta-llama/Llama-3.1-8B-Instruct desarrollado por XOTaiChi (con el identificador de repositorio grpo_llama3_0204) para mejorar la resistencia frente a ataques de inyeccion de prompts (prompt injection). El modelo implementa el metodo CBC (Consistency Before Complying), presentado en el articulo "Staying on Task: Defending Against Prompt Injection via Task Consistency Checking" publicado en EMNLP 2026. La idea central es que el modelo razone primero sobre la consistencia entre la tarea original y la instruccion inyectada antes de obedecerla, de modo que rechace instrucciones que desvian su comportamiento del objetivo asignado.

El modelo parte de la arquitectura Llama 3.1 de 8.030.261.248 parametros (8B), un transformer denso con atencion por grupos (GQA) y una ventana de contexto de 128.000 tokens heredada del modelo base. El ajuste se realiza en dos fases: un ajuste supervisado (SFT) sobre datos de razonamiento de consistencia de tarea y, posteriormente, una alineacion con GRPO (Group Relative Policy Optimization) para reforzar la conducta de verificacion antes de cumplir una instruccion. El objetivo declarado es preservar la utilidad de la tarea mientras se incrementa la robustez frente a inyecciones.

Su relevancia actual radica en que la inyeccion de prompts es uno de los vectores de ataque mas criticos en sistemas con LLM expuestos a contenido externo (RAG, agentes, correo, navegacion web). Este checkpoint ofrece un punto de partida ya alineado para defensa, con licencia Llama 3.1 y pesos en safetensors compatibles con transformers y text-generation-inference. La informacion publica disponible es escasa: no hay datos de benchmarks en la model card ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con GQA, heredada del modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con query grouping (GQA) y RoPE para codificacion posicional, con un contexto nativo de 128.000 tokens. Sobre esta base, el autor aplica un proceso de alineacion especifico para defensa frente a inyeccion de prompts. Segun la model card, CBC (Consistency Before Complying) combina razonamiento de consistencia de tarea, ajuste supervisado (SFT) y alineacion con GRPO, con el objetivo explicito de mantener la utilidad de la tarea mientras se incrementa la resistencia a inyecciones.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos de SFT frente a los de RL, ni los hiperparametros de GRPO (tamano de grupo, recompensas, KL). La model card indica que los datos de entrenamiento y el codigo de sintesis de datos se publicaran proximamente, y que el codigo de evaluacion esta en el repositorio del proyecto. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat, usando la plantilla de chat incluida en el checkpoint.
- Razonamiento de consistencia de tarea: el modelo esta entrenado para evaluar si una instruccion entrante es coherente con la tarea original antes de obedecerla.
- Defensa frente a inyeccion de prompts: resistencia a instrucciones maliciosas embebidas en contenido externo (documentos, herramientas, entradas de usuario).
- Mantenimiento de la utilidad de la tarea: el autor declara preservacion del rendimiento en la tarea legitima, aunque no se aportan cifras en la model card.
- Soporte de tool calling y function calling: heredado del modelo base Llama 3.1 Instruct; no se documenta un ajuste especifico ni evaluacion en este checkpoint.
- Razonamiento multi-paso y uso como componente de agentes: posible por herencia del modelo base, sin evaluacion publicada en esta ficha.
- Capacidades multilingues: no declaradas; dependen del modelo base y no se han verificado para este checkpoint.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito (thinking mode).

## Casos de uso

- Defensa de pipelines RAG: el modelo puede colocarse como capa de verificacion o como generador principal en sistemas que recuperan documentos externos, de modo que detecte instrucciones inyectadas en el texto recuperado antes de ejecutarlas.
- Agentes con acceso a herramientas: en un agente que lee correos, tickets o paginas web, el modelo puede razonar si una instruccion recibida coincide con la tarea asignada y bloquear desvios hacia acciones no autorizadas.
- Atencion al cliente automatizada: al procesar mensajes de usuario que puedan contener intentos de manipulacion, el modelo evalua la consistencia con la politica de la tarea y mantiene el flujo conversacional previsto.
- Moderacion y filtrado de contenido en produccion: como clasificador generativo de instrucciones sospechosas, aprovechando su entrenamiento especifico en consistencia de tarea.
- Evaluacion de robustez de otros LLM: uso como modelo de referencia en experimentos de red teaming para comparar tasas de exito de inyeccion frente a un Llama 3.1 Instruct sin ajustar.
- Investigacion en alineacion con RL: punto de partida para reproducir o extender el metodo CBC con GRPO, dado que el autor publicara datos y codigo de sintesis.
- Despliegue en entornos con requisitos de licencia permisiva: al estar bajo Llama 3.1 Community License, puede integrarse en productos comerciales que cumplan la Acceptable Use Policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de resistencia a inyeccion (por ejemplo, tasas de exito de ataque o de utilidad de tarea); solo remite al articulo de EMNLP 2026 y al repositorio de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits, alrededor de 4-5 GB, aunque el repo no publica artefactos cuantizados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090/4090 viables con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion 8 o 4 bits; en FP16 completo queda al limite de 24 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta endpoints_compatible), vLLM; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XOTaiChi/grpo_llama3_0204 (este) | 8,03B | 128k (heredado) | Defensa anti prompt injection (CBC + GRPO) | Llama 3.1 | Hugging Face, ModelScope |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Instruct generalista | Llama 3.1 | Hugging Face |
| Meta Llama 3.1 8B (base) | 8,03B | 128k | Modelo base sin alineacion | Llama 3.1 | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas con alternativas especializadas en defensa frente a inyeccion.

## Limitaciones y advertencias

- No hay benchmarks publicados en la model card; la eficacia defensiva declarada no esta cuantificada en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de 8B, no mitigado de forma especifica por este ajuste.
- Sesgos heredados del corpus de entrenamiento de Llama 3.1 y de los datos de SFT/GRPO no documentados.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- La defensa frente a inyeccion no es absoluta: un modelo alineado puede seguir siendo vulnerable a ataques novedosos o adaptativos.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluida la Acceptable Use Policy y obligaciones de atribucion; revisar el texto completo en el repositorio.
- Datos de entrenamiento y codigo de sintesis aun no publicados, lo que limita la reproducibilidad.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp/Ollama.
- El checkpoint incluye su propio tokenizer y plantilla de chat; usar otra plantilla puede degradar el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/XOTaiChi/grpo_llama3_0204
- ModelScope (mirror): https://modelscope.cn/models/augusttailong/grpo_llama3_0204
- Codigo y evaluacion: https://github.com/XOTaichi/CBC-PI
- Paper (EMNLP 2026): https://aclanthology.org/2026.emnlp-main.2303/
- DOI: https://doi.org/10.18653/2026.emnlp-main.2303
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
