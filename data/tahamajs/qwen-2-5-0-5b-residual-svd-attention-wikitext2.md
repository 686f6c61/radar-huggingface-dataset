# tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint experimental del modelo Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `ResidualSVDAttention` (Res-SVD Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es tahamajs, y el modelo se ha destilado sobre el conjunto WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`). No se trata de un modelo de propósito general, sino de una pieza de investigación sobre atención subcuadrática de bajo rango espectral.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only, 24 capas, 14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y reemplaza 18 de las 24 capas de atención por Res-SVD Attention, conservando 6 capas cuadráticas completas como anclas en los índices `[3, 7, 11, 15, 19, 23]` (patrón `hybrid_3_1`). El entrenamiento se limita a una destilación de conocimiento en dos etapas sobre WikiText-2, con 380 pasos totales y 180,5 segundos de optimización.

Su relevancia es acotada: sirve como banco de pruebas reproducible para evaluar si un operador de atención subcuadrática puede recuperar perplejidad tras una cirugía agresiva de atención. La perplejidad final en validación de WikiText-2 es de 328,55, un valor muy alto para estándares de modelado de lenguaje, lo que refleja el carácter exploratorio del checkpoint y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `ResidualSVDAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | No disponible (el checkpoint solo contiene pesos de atencion; el modelo base Qwen2.5-0.5B tiene 0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos en FP16 en el ejemplo de uso) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 51,37 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en Qwen2.5-0.5B, con 24 capas, 14 cabezas de consulta y 2 cabezas de clave/valor (GQA), `head_dim=64` y `hidden_size=896`. La modificacion principal es la sustitucion de la atencion en 18 de las 24 capas por `ResidualSVDAttention`, un operador de atencion de bajo rango espectral basado en SVD residual. El adaptador `QwenAttentionAdapter` gestiona la expansion 14:2 de cabezas KV y el contrato de `o_proj` unico. Las capas `[3, 7, 11, 15, 19, 23]` conservan atencion cuadratica completa como anclas.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2. La etapa 1 (alineacion con backbone congelado) dura 115 pasos (54,2 s) y usa MSE y coseno sobre estados ocultos por capa con peso 0,25, con `lm_head` desactivado. La etapa 2 (destilacion de representacion multicapa) dura 265 pasos (126,1 s) con peso 0,50. En total son 380 pasos, 180,5 s, con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM es de 17.317 MB en FP16 con autocast y parametros maestros en FP32. La perplejidad causal pasa de 119.371,82 (etapa 0, post-cirugia sin destilar) a 328,55 tras la destilacion.

## Capacidades

- Generacion de texto causal autorregresiva (soporte `supports_causal=Yes`).
- Soporte de atencion bidireccional (`supports_bidirectional=Yes`) y cross-attention (`supports_cross_attention=Yes`) a nivel de modulo.
- Operador de atencion personalizado (`is_custom_attention=Yes`).
- No soporta GQA nativo (`supports_gqa=No`); el adaptador realiza la expansion de cabezas KV.
- Soporte de RoPE marcado como `N/A` en el perfil del modulo.
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint permite reproducir el pipeline de cirugia y destilacion de NeuralOps para comparar operadores alternativos de atencion sobre una base Qwen2.5-0.5B.
- Benchmark de recuperacion de perplejidad: sirve para medir cuanto se recupera tras reemplazar atencion cuadratica por Res-SVD, con la perplejidad de WikiText-2 como metrica de referencia (328,55).
- Experimentos de destilacion de conocimiento: las dos etapas documentadas (alineacion con backbone congelado y destilacion multicapa) se pueden reutilizar como receta para otros operadores del registro.
- Prototipado de arquitecturas hibridas: el patron `hybrid_3_1` con anclas cuadraticas en indices fijos permite estudiar el equilibrio entre coste y calidad de atencion.
- Docencia y divulgacion: ejemplo didactico de sustitucion quirurgica de modulos en un transformer preentrenado con adaptadores que respetan contratos de proyeccion.
- Pruebas de integracion de la libreria `neuralops`: el modelo se carga con `load_surgeried_model` y sirve para validar la API del hub de NeuralOps en entornos de CI.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 328,55 |

Telemetria de entrenamiento declarada por el autor:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD (etapa 0) | 119.371,82 |
| Perplejidad causal post-KD | 328,55 |
| Delta de perplejidad | -119.043,27 |
| Pasos totales / tiempo | 380 pasos / 180,5 s |
| Pico de VRAM | 17.317 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 requiere aproximadamente 1 GB de pesos; con overhead de activaciones y contexto, un entorno de 2-4 GB es suficiente. El pico de 17.317 MB corresponde al entrenamiento, no a inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, en GPUs con 4 GB o mas (por ejemplo, RTX 3050 8 GB, RTX 4060, RTX 4090).
- Opciones de despliegue: el modelo requiere la libreria `neuralops` y el adaptador de cirugia (`apply_qwen_attention_surgery`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2 | 0,5 mil millones (base) | No disponible | 328,55 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B | 0,5 mil millones | 32.768 tokens (segun documentacion de Qwen) | No disponible en esta ficha | Apache 2.0 (segun Qwen) | Hugging Face |
| Alternativas de 0,5B con atencion estandar | 0,5 mil millones | Variable | No disponible | Variable | Hugging Face |

No se dispone de datos de perplejidad comparables para el modelo base ni para otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad muy elevada (328,55) en WikiText-2, lo que indica una calidad de modelado de lenguaje muy por debajo de lo esperado para un modelo de 0,5B; no es apto para produccion.
- Entrenado exclusivamente sobre WikiText-2, un corpus limitado y de dominio enciclopedico; probable sobreajuste al dominio y escasa generalizacion.
- Solo soporta ingles.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B hereda los sesgos del modelo base.
- Riesgo alto de alucinacion y generacion incoherente dado el bajo rendimiento medido.
- La licencia MIT del checkpoint no exime de las condiciones del modelo base Qwen2.5-0.5B; conviene revisar la licencia del modelo base para uso comercial.
- Requiere la libreria `neuralops` y el pipeline de cirugia de atencion; no es cargable directamente con `transformers` sin aplicar la sustitucion de modulos.
- El checkpoint solo contiene pesos de atencion (51,37 MB); es necesario descargar el modelo base por separado.
- Los resultados de benchmarks no estan verificados (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
