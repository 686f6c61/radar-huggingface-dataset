# wyf-yfw/MiniSeek-V1-base

## Resumen

MiniSeek-V1-base es un modelo de lenguaje de tipo decoder-only con arquitectura Mixture-of-Experts (MoE), desarrollado por el usuario wyf-yfw y publicado en Hugging Face bajo licencia MIT. Con 186.933.744 parámetros (~186,93M), se presenta como una reproducción a pequeña escala de la pila arquitectónica de DeepSeek-V4.1-Flash, con el objetivo declarado de alinear componentes (Dense, MoE, Flash; base y chat) sin pretender igualar el rendimiento del modelo original. Es la versión base, únicamente preentrenada, de la familia MiniSeek-M; la variante con SFT y formato conversacional se publica por separado como MiniSeek-V1.

El modelo emplea una arquitectura MoE con 1 experto compartido y 64 expertos enrutados con activación top-6, atención con Q de bajo rango, KV compartida y ventana deslizante con índice comprimido, además de componentes propietarios denominados mHC (4 flujos, Sinkhorn 20) y Engram (en las capas 1 y 3). El contexto de entrenamiento es muy reducido: 256 tokens. El vocabulario es de 6.400 entradas, basado en el tokenizador MiniMind, con plantilla ChatML. Los idiomas declarados son chino e inglés.

Su relevancia es fundamentalmente experimental y educativa: ofrece una implementación abierta y compacta de un stack MoE inspirado en DeepSeek, útil para estudiar enrutamiento de expertos, atención con compresión de índice y arquitecturas híbridas en un tamaño que cabe en hardware de consumo. No obstante, con solo 10.000 pasos de preentrenamiento, contexto de 256 tokens y ausencia de SFT, su utilidad en producción es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only MoE (estilo DeepSeek-V4.1-Flash), atención con Q de bajo rango, KV compartida, SWA con índice comprimido, mHC y Engram |
| Parametros totales | 186.933.744 (~186,93M) |
| Parametros activos | 1 experto compartido + 6 de 64 enrutados por token (top-6); no se publica el recuento exacto de parámetros activos |
| Longitud de contexto | 256 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; entrenamiento en BF16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, FP32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas y dimensión 512, con una capa MoE que combina 1 experto compartido y 64 expertos enrutados, activando 6 por token (`moe_inter_dim=176`). El enrutamiento usa sqrt-softplus con bias, `route_scale=1.5` y clamp SwiGLU=10. La atención incorpora Q de bajo rango, KV compartida y ventana deslizante con índice comprimido (`index topk=64`). Se añaden dos componentes propietarios: mHC (4 flujos con normalización Sinkhorn de 20 iteraciones) y Engram en las capas 1 y 3. La estructura general se describe como "CED codificación 4 + decodificación 4". El vocabulario es de 6.400 tokens (tokenizador MiniMind) con plantilla ChatML; el embedding no está atado a la cabeza LM.

El entrenamiento se realizó sobre el dataset `pretrain_mix_12g_clean.jsonl` con `max_seq_len=256`, batch 24 con empaquetado, optimizador AdamW con LR 3e-4 → 1e-6, warmup de 200 pasos y `aux_coef=1e-4`. El checkpoint publicado corresponde al paso 10.000, con loss de entrenamiento ≈ 3,7117 y loss de validación ≈ 3,05. No se documenta el número total de tokens procesados ni el uso de RLHF o DPO (es un modelo exclusivamente preentrenado).

## Capacidades

- Generación de texto autoregresiva y continuación de secuencias (modelo base, no ajustado a instrucciones).
- Razonamiento y código: no hay evidencia publicada de capacidades específicas; el estado de preentrenamiento temprano hace improbable un rendimiento fiable.
- Soporte multilingüe limitado a chino e inglés.
- Plantilla ChatML incluida en el tokenizador, aunque el modelo no está entrenado para diálogo.
- Token de parada `<|im_end|>`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre enrutamiento MoE: el modelo permite estudiar el comportamiento de 64 expertos enrutados con top-6 y bias de enrutamiento en un tamaño que cabe en una sola GPU, analizando distribución de carga y colapso de expertos.
- Experimentación con atención comprimida: sirve para evaluar la ventana deslizante con índice topk=64 y la KV compartida en tareas de continuación de texto corto.
- Reproducción de arquitecturas tipo DeepSeek a escala reducida: útil como banco de pruebas para comparar decisiones de diseño (mHC, Engram, Q de bajo rango) antes de escalar.
- Fine-tuning educativo: al ser un base de ~187M con licencia MIT, puede ajustarse en tareas específicas de dominio con recursos modestos, aunque el contexto de 256 tokens limita las tareas de secuencias largas.
- Generación de texto en chino e inglés para prototipos: continuación de frases y párrafos cortos en entornos de demostración, asumiendo calidad limitada por el escaso entrenamiento.
- Estudio de tokenizadores compactos: el vocabulario de 6.400 entradas permite analizar el equilibrio entre tamaño de embedding y cobertura lingüística en chino e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,75 GB solo para pesos (186,93M × 4 bytes), más overhead de activaciones y KV cache; en BF16/FP16 bajaría a ~0,37 GB.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4060, 4090) e incluso en CPU para inferencia de secuencias cortas.
- El contexto de 256 tokens mantiene la KV cache muy pequeña, por lo que el throughput no está limitado por memoria de contexto.
- Opciones de despliegue: al no soportar `AutoModelForCausalLM`, requiere el código propio `miniseek_m` (disponible en el repo de Hugging Face o en GitHub) con PyTorch y safetensors; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniSeek-V1-base | ~186,93M | 256 | MoE decoder-only (1+64, top-6) | MIT | Hugging Face, código propio |
| MiniSeek-M0.1-base | No disponible | No disponible | MoE LM (1+32, top-2) | No disponible | Hugging Face |
| MiniSeek-V1 (chat) | No disponible | No disponible | MoE con SFT | MIT | Hugging Face |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo únicamente preentrenado: no sigue instrucciones ni mantiene diálogos; para conversación debe usarse la variante MiniSeek-V1.
- Entrenamiento muy temprano (10.000 pasos, loss de validación ≈ 3,05): la calidad de la continuación de texto es limitada.
- Contexto de solo 256 tokens, insuficiente para la mayoría de aplicaciones reales (documentos, código, conversaciones largas).
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo.
- Sesgos no evaluados: no se documentan análisis de sesgo para chino o inglés.
- Cobertura lingüística restringida a chino e inglés; el vocabulario de 6.400 tokens puede degradar el rendimiento en otros idiomas.
- Licencia MIT permite uso comercial, pero la falta de evaluación y el estado temprano del modelo desaconsejan su uso en producción sin validación previa.
- Requiere código personalizado (`miniseek_m`); no es compatible con `AutoModelForCausalLM` de Transformers, lo que complica la integración en pipelines estándar.
- El token de parada es `<|im_end|>`; debe configurarse explícitamente para evitar generaciones sin fin.

## Enlaces

- Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-V1-base
- Variante chat: https://huggingface.co/wyf-yfw/MiniSeek-V1
- Versión anterior: https://huggingface.co/wyf-yfw/MiniSeek-M0.1-base
- GitHub: https://github.com/wyf-yfw/miniseek
