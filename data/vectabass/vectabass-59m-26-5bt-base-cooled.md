# VectaBass/vectabass-59m-26.5bt-base-cooled

## Resumen

vectabass-59m-26.5bt-base-cooled es un modelo de lenguaje base de 59,5 millones de parametros totales (27,3 millones no pertenecientes a los embeddings) desarrollado por VectaBass dentro de su programa de investigacion sobre leyes de escala y IA soberana del Reino Unido. Se trata de la celda N0-D5 del "AR addendum", un escalon adicional situado por debajo de la escalera principal de 100M a 1,6B parametros, entrenado con la misma receta y los mismos datos para poder verificar la ley de escala a un tamano menor.

El modelo emplea una arquitectura transformer de tipo Llama con atencion causal, GQA 2:1 y una innovacion propia denominada atencion autoexclusiva (XSA), que no existe en Llama. Cuenta con 6 capas, anchura 640, FFN SwiGLU de 1728 y una ventana de contexto de solo 2048 tokens mediante RoPE con base 10000. El vocabulario es GPT-2 BPE ampliado con 26 tokens especiales hasta 50304 filas.

Es relevante por su caracter abierto (licencia Apache 2.0), su enfoque en datos de dominio publico britanico (incluyendo fuentes parlamentarias y lenguas celtas) y porque documenta de forma exhaustiva la receta de entrenamiento, el contrato de ejecucion y la procedencia de los pesos. No es un modelo pensado para uso como asistente: es una pieza de un estudio de scaling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atencion autoexclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 27.279.360 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (ingles, gales, gaelico escoces, irlandes, manes, cornes y scots) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |
| Anchura / capas | 640 / 6 |
| Cabezas | 10 query, 5 key-value, dim 64 |
| Feed-forward | SwiGLU, 1728 |
| Vocabulario | 50304 filas (GPT-2 BPE 50257 + 26 especiales + padding) |
| Tokens de entrenamiento | 26.464.747.520 (970 por parametro no-embedding) |
| Hardware de entrenamiento | 2 x NVIDIA GH200 120GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de 6 capas con anchura 640. Usa atencion causal con GQA de ratio 2:1 (10 cabezas de consulta, 5 de clave-valor, dimension 64), FFN SwiGLU de dimension 1728, RMSNorm en pre-norm y embeddings de posicion RoPE con base 10000 y contexto de 2048 tokens. La innovacion destacable es la atencion autoexclusiva (XSA), un mecanismo que no existe en Llama y que obliga a cargar el codigo del modelo con `trust_remote_code=True`. Los embeddings de entrada y salida estan atados.

El entrenamiento utilizo 26.464.747.520 tokens (970 por parametro no-embedding) con un batch de 327.680 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9 y 0.95). El LR pico fue 0.00359, con warmup de 27M tokens, fase constante y un cooldown 1-sqrt hasta cero en el ultimo 20%. El weight decay fue 0.119 sobre matrices. Se entreno en bf16 con pesos maestros fp32, estadisticas de norma, angulos RoPE y logits en fp32, sobre 2 x NVIDIA GH200 120GB.

Los datos provienen de la "phase-1-release view": 47 bins de texto con licencia abierta, unos 96B tokens unicos, incluyendo fineweb-edu, fineweb-2 y finemath, ademas de fuentes del sector publico britanico, parlamentarias y de lenguas celtas. El detalle de cada bin, su cuota y licencia esta en `DATA.md`. No se menciona RLHF ni DPO: es un modelo puramente base.

## Capacidades

- Generacion de texto autoregresiva en ingles y, en menor medida, en lenguas celtas (gales, gaelico escoces, irlandes, manes, cornes) y scots.
- Modelado de lenguaje base: continuacion de texto, completado de frases y modelado de probabilidad de secuencias.
- Razonamiento y codigo: no se documentan capacidades especificas ni evaluaciones; al ser un modelo base de 27M parametros no-embedding, su rendimiento en estas tareas es muy limitado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a los siete idiomas listados, con el ingles como idioma dominante.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- No esta ajustado a instrucciones ni a seguridad.

## Casos de uso

- Investigacion sobre leyes de escala: el modelo sirve como punto de calibracion adicional (N0, 27,3M no-embedding) para verificar que la ley de escala ajustada en el rango 100M-1,6B se mantiene a menor tamano. Se usaria comparando su loss de validacion (2,5614 nats/token) con las predicciones de la ley.
- Reproduccion de experimentos de entrenamiento: al publicar contrato de ejecucion, sha256 del checkpoint y receta completa (Muon + AdamW, schedule, batch), permite reproducir o auditar el pipeline en hardware modesto (2 x GH200 o equivalente).
- Modelado de lenguas celtas de bajo recursos: util para medir perplejidad y estudiar el comportamiento de un LM pequeno en gales, gaelico, irlandes, manes y cornes, asi como para generar texto de prueba en estos idiomas.
- Filtrado y puntuacion de corpus: al ser un modelo pequeno y rapido en bf16, puede usarse para calcular log-probabilidades y filtrar datos de dominio britanico o celta en pipelines de curacion.
- Educacion y docencia: ejemplo didactico completo de un transformer tipo Llama con GQA, RoPE y una variante de atencion (XSA), con codigo y pesos disponibles para estudiar la implementacion.
- Baseline en experimentos de scaling de datos: dado que se entreno con 970 tokens por parametro no-embedding, sirve como referencia para estudiar la relacion entre presupuesto de tokens y loss en modelos por debajo de 100M.
- Pruebas de infraestructura de inferencia: su tamano (repo de 0,1 GB) permite validar pipelines de despliegue, carga con `trust_remote_code` y comparaciones de logits bit a bit frente al codigo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la informacion disponible. El autor indica explicitamente que las puntuaciones zero-shot "no se han medido todavia".

| Metrica | Valor |
|---|---|
| Loss de validacion (canon-8192, 8192 x 2048 tokens) | 2,5614 nats por token |
| Loss reproducida con PyTorch SDPA | 2,5615 nats por token |
| Consistencia con el codigo de entrenamiento | Logits identicos bit a bit (entrenamiento con FlashAttention-4) |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 59,5M parametros ocupan aproximadamente 0,12 GB de pesos; con cache KV para contexto 2048 y overhead de runtime, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente; el entrenamiento uso 2 x NVIDIA GH200 120GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16` (metodo documentado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al requerir codigo remoto para XSA, la compatibilidad con esos motores no esta garantizada y no se ha verificado.
- Latencia y throughput estimados: no disponible. Por tamano, la inferencia es de baja latencia incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-59m-26.5bt-base-cooled | 59,5M totales (27,3M no-embedding) | 2048 | Apache 2.0 | Base, XSA, enfoque en leyes de escala y datos britanicos/celtas; sin benchmarks publicados |
| GPT-2 small (referencia de la familia GPT-2 BPE) | 124M | 1024 | MIT | Base, sin GQA ni XSA; ampliamente usado como baseline, con benchmarks publicados |
| Modelos de la escalera AR de VectaBass (100M-1,6B) | 100M-1,6B | no disponible | no disponible | Misma receta y datos; sirven como referencia directa de la ley de escala |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Base/chat con contexto similar; mucho mayor, no comparable en regimen de escala |

La comparacion cuantitativa de rendimiento no es posible porque este modelo no tiene benchmarks zero-shot publicados. La comparacion mas significativa es interna: frente a las celdas de 100M-1,6B de la misma escalera, que comparten receta y datos.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escala, no un asistente: afirmara cosas falsas con fluidez y no esta ajustado a instrucciones.
- No tiene ajuste de seguridad ni filtrado de salidas; puede generar contenido inapropiado o danino.
- Contexto muy corto: solo 2048 tokens, insuficiente para tareas de contexto largo.
- Predominio del ingles; el resto de idiomas (gales, gaelico escoces, irlandes, manes, cornes, scots) tienen cuotas menores y su calidad es previsiblemente inferior.
- Capacidad limitada por tamano: con 27,3M parametros no-embedding, el razonamiento, las matematicas y la generacion de codigo son muy debiles; no hay evaluaciones que lo cuantifiquen.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar codigo del repositorio; conviene auditar ese archivo antes de usarlo en produccion.
- Debe ejecutarse en bf16, tal como se entreno; otros formatos o cuantizaciones no estan documentados ni validados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion como asistente y no ofrece garantias de calidad.
- Sesgos: no se documentan analisis de sesgo; los datos incluyen fuentes del sector publico britanico y parlamentarias, cuyo sesgo de dominio puede reflejarse en las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-59m-26.5bt-base-cooled
- Documentacion de datos (`DATA.md`, referenciada en la model card): no disponible como URL directa
- Procedencia (`provenance.json`, referenciado en la model card): no disponible como URL directa
- Codigo de modelado (`modeling_vectabass.py`, incluido en el repo): https://huggingface.co/VectaBass/vectabass-59m-26.5bt-base-cooled/blob/main/modeling_vectabass.py
- Paper: pendiente de publicacion ("Paper forthcoming", segun el autor)
- Referencia de Isambard-AI: McIntosh-Smith, Alam y Woods (2024), https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
