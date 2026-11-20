# ukisai/Swift-Qwen3.8-27B-NVFP4

## Resumen

Swift-Qwen3.8-27B-NVFP4 es una cuantizacion de precision mixta NVFP4/FP8 del modelo Swift-Qwen3.8-27B, desarrollado por UkisAI como derivado de Qwen3.8-27B orientado a razonamiento eficiente en tokens. El checkpoint se ha generado directamente desde los pesos originales en BF16 usando NVIDIA Model Optimizer (ModelOpt), siguiendo el mapeo de precision verificado de la version oficial de NVIDIA para el mismo modelo base. La arquitectura, los componentes de vision, el tokenizer y los pesos MTP en BF16 se conservan intactos.

El modelo es multimodal (pipeline image-text-to-text) y esta pensado para servir con vLLM sobre hardware Hopper. Su propuesta principal es reducir el coste de memoria de pesos y el gasto de tokens de razonamiento sin degradar la calidad, manteniendo el KV cache sin cuantizar. Segun los datos reales de safetensors, el checkpoint contiene 18.164.649.200 parametros, con un tamano de repositorio de 74,2 GB y un checkpoint cuantizado de aproximadamente 21,945 GB.

Es relevante ahora porque combina tres tendencias: cuantizacion de bajo nivel (FP4 con bloques de 16), optimizacion del presupuesto de tokens en modelos de razonamiento y despliegue multimodal en infraestructura Hopper con vLLM. La licencia es propietaria (swift-open-license-1.0) y el repositorio esta sujeto a gating.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con 48 capas Gated DeltaNet y atencion completa; componentes de vision y MTP (multi-token prediction) |
| Parametros totales | 18.164.649.200 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (block size 16), FP8 E4M3, BF16 para embeddings, norms, convoluciones, vision y MTP |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other, gated) |
| Formato de pesos | safetensors (NVIDIA ModelOpt mixed precision), libreria vLLM |

## Arquitectura y entrenamiento

La arquitectura combina 48 capas Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atencion completa. El checkpoint mantiene 144 proyecciones grandes de DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`) en FP8 E4M3, 64 proyecciones de atencion completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) tambien en FP8 E4M3, y 192 proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) mas `lm_head` en NVFP4 con bloque de 16. Embeddings, norms, proyecciones pequenas de DeltaNet, convoluciones, vision y los 15 tensores MTP se conservan en BF16. El KV cache no se ha cuantizado.

La calibracion se realizo con 2.048 ejemplos de la coleccion Nemotron post-training v3 de NVIDIA (siete fuentes), con maximo de 4.096 tokens, semilla 42 y 6.459.330 tokens efectivos. Se usaron dos pasadas completas de calibracion y los 193 modulos NVFP4 obtuvieron cobertura Local-Hessian; las proyecciones FP8 usan calibracion max. Los 798 tensores BF16 retenidos, incluidos los 15 de MTP, se verificaron byte a byte contra el modelo fuente. La innovacion principal del modelo base es el "efficient-thinking": razonamiento con presupuesto de tokens reducido, medido en la model card con benchmarks como LiveCodeBench v6.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente en tokens (efficient-thinking).
- Razonamiento multi-paso y resolucion de problemas de codigo (la demo de la model card usa un prompt de LiveCodeBench v6).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con componentes de vision preservados en BF16.
- Prediccion multi-token (MTP) para decodificacion especulativa, con los 15 tensores MTP en BF16.
- Conversacion multi-turno (tag conversational).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento sobre codigo en produccion: el modelo esta evaluado con prompts de LiveCodeBench v6 y su modo efficient-thinking reduce el gasto de tokens por respuesta, lo que abarata el coste por consulta en asistentes de programacion.
- Despliegue de razonamiento a gran escala en Hopper: al ocupar aproximadamente 21,945 GB de pesos en lugar de los 74,2 GB del repositorio completo, libera memoria para un KV cache mayor y permite servir mas concurrencia por GPU H100.
- Analisis de documentos con imagenes: el pipeline image-text-to-text permite extraer y razonar sobre diagramas, capturas o figuras junto con el texto asociado, manteniendo la torre de vision en BF16.
- Inferencia de baja latencia con vLLM: la integracion nativa con vLLM y la decodificacion especulativa via MTP reducen el tiempo por token en cargas interactivas.
- Generacion aumentada por recuperacion con contexto largo: las 48 capas DeltaNet de estado lineal abaratan el coste de secuencias largas frente a un transformer de atencion densa equivalente.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de NVFP4/FP8 frente al BF16 original en tareas de razonamiento y codigo.
- Prototipado de asistentes multimodales en infraestructura NVIDIA: el formato ModelOpt mixed precision encaja en pipelines que ya usan TensorRT-LLM o vLLM sobre Hopper.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con puntuaciones, tokens y medianas para comparar el modelo base Swift frente a alternativas, con resultados medidos sobre LiveCodeBench v6 y otras pruebas. Sin embargo, los valores numericos concretos no estan disponibles en la informacion proporcionada, por lo que no se reproducen aqui.

No se han publicado resultados de benchmarks en la informacion disponible con cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,945 GB solo para pesos del checkpoint cuantizado; hay que sumar el KV cache (no cuantizado) y las activaciones.
- GPU recomendadas: NVIDIA H100 (Hopper), requisito implicito por el uso de NVFP4 y ModelOpt; el tag `hopper` confirma esta orientacion.
- GPU consumer: no se indica compatibilidad con GPUs consumer; NVFP4 requiere soporte de hardware Hopper o posterior.
- Opciones de despliegue: vLLM (libreria declarada), con formato ModelOpt mixed precision; TensorRT-LLM no se menciona explicitamente.
- Latencia y throughput: no disponible en la informacion proporcionada; la model card incluye un video de demostracion de velocidad pero sin cifras en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-NVFP4 | 18.164.649.200 | no disponible | NVFP4/FP8/BF16 mixta | swift-open-license-1.0 (gated) | Hugging Face, vLLM |
| Swift-Qwen3.8-27b (BF16) | no disponible | no disponible | BF16 | swift-open-license-1.0 | Hugging Face |
| Swift-Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | swift-open-license-1.0 | Hugging Face |
| NVIDIA Qwen3.8-27B-NVFP4 | no disponible | no disponible | NVFP4/FP8 | no disponible | Hugging Face |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria: swift-open-license-1.0 con acceso gated; el uso comercial requiere revisar los terminos y posiblemente licencia enterprise segun la propia model card.
- Cuantizacion agresiva: NVFP4 en las proyecciones MLP y `lm_head` puede introducir degradacion en tareas sensibles a la precision numerica; no se aportan metricas de perdida frente al BF16.
- KV cache sin cuantizar: el ahorro de memoria se limita a los pesos, por lo que contextos muy largos siguen consumiendo VRAM considerable.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera del ingles sin evaluacion propia.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos de razonamiento.
- Sesgos: no documentados en la model card.
- Dependencia de hardware Hopper: el formato NVFP4 no es portable a GPUs sin soporte FP4 nativo.
- Contexto maximo no especificado: impide planificar cargas con ventanas largas sin pruebas previas.
- Verificacion de integridad: el autor afirma haber comprobado byte a byte los 798 tensores BF16, pero no hay una evaluacion independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Version GGUF: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Referencia de precision de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Inventario de precision: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4/blob/main/quantization/precision-inventory.csv
- Receta ModelOpt: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4/blob/main/quantization/modelopt-recipe.json
- Manifiesto de calibracion: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4/blob/main/quantization/calibration-manifest.json
- Versiones de paquetes: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4/blob/main/quantization/versions.json
- Demo de velocidad: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4/resolve/main/swift-speed-demo.mp4
