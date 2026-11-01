# ThakiCloud/Thaki-ASR-KO-1.7B

## Resumen

Thaki-ASR-KO-1.7B es un modelo de reconocimiento automático del habla (ASR) en coreano, desarrollado por ThakiCloud mediante un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-ASR-1.7B, que parte de licencia Apache-2.0. El modelo está especializado en habla telefónica y de atención al cliente (상담) en coreano, con un énfasis particular en contenido numérico (precios, fechas, identificadores, importes), manteniendo al mismo tiempo la calidad en conversación general como salvaguarda.

Con 2.038.052.480 parámetros reales (aproximadamente 2.000 millones), el modelo se distribuye en formato safetensors y se integra a través de la librería `transformers` y del paquete `qwen-asr`, que replica la API de inferencia del modelo base. La longitud de contexto en audio no está especificada en la información disponible; todas las evaluaciones publicadas se han medido sobre fragmentos de audio de 20 segundos o menos por emisión, y el autor no garantiza el rendimiento fuera de esa ventana.

Su relevancia actual radica en que aborda un nicho concreto y poco cubierto: la transcripción de audio telefónico coreano con alta densidad numérica, donde los modelos ASR generalistas suelen cometer errores en cifras. El autor publica un histórico de evaluación transparente, incluyendo un primer intento fallido (Step 5, NO-GO) y una reevaluación independiente posterior (Step 5b, GO) que superó las cinco puertas preregistradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-1.7B; familia Qwen3 ASR) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado solo con audio de ≤ 20 s por emisión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-ASR-1.7B, inicializado desde los pesos originales del base y entrenado en una única ejecución (denominada R1). El checkpoint liberado es el checkpoint-1200. No se ha realizado reentrenamiento adicional para esta publicación. La arquitectura interna detallada (tipo de encoder de audio, mecanismo de atención, etc.) no se especifica en la información disponible más allá de la referencia al modelo base de la familia Qwen3 ASR.

Los datos de entrenamiento provienen de los conjuntos Bingsu/zeroth-korean y amphion/Emilia-Dataset, según las etiquetas de la model card. El énfasis del ajuste se puso en habla telefónica y de atención al cliente en coreano y en contenido numérico, con el habla conversacional general como restricción de calidad. El repositorio contiene únicamente pesos y archivos de configuración: no incluye audio de entrenamiento, transcripciones, metadatos ni datos derivados. No se detalla en la información proporcionada si hubo RLHF, DPO ni el número exacto de tokens de entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en coreano, con especialización en audio telefónico y de atención al cliente.
- Transcripción robusta de contenido numérico: precios, fechas, identificadores y cantidades.
- Mantenimiento de calidad en habla general leída y conversacional en coreano.
- Inferencia por lotes mediante `max_inference_batch_size` (hasta 16 en el ejemplo de la model card).
- Decodificación greedy por defecto (temperatura 0) en la receta recomendada.
- Integración con la librería `transformers` y el paquete `qwen-asr`.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está ajustado específicamente sobre habla telefónica de 상담, por lo que transcribe conversaciones multi-turno de centros de contacto con menor tasa de error que el base (CER 6,07 % frente a 6,88 % en el conjunto TEST-D de 900 emisiones).
- Extracción de datos numéricos en postventa: la mejora en robustez numérica (88,7 % frente a 66,4 % en el conjunto combinado de 981 emisiones numéricas) lo hace adecuado para capturar importes, fechas e identificadores en gestiones telefónicas.
- Automatización de actas y resúmenes de llamadas: al reducirse los errores «plausibles pero incorrectos» (de 12 a 6), disminuye el riesgo de introducir cifras erróneas en resúmenes generados aguas abajo.
- Enrutamiento y analítica de contact center: la transcripción de audio telefónico permite clasificar motivos de llamada, medir tiempos y alimentar paneles de calidad, con un RTF de 0,109–0,138 según conjunto, cercano al del modelo base.
- Verificación de calidad (QA) de agentes: la transcripción fiable de diálogos permite auditar guiones, detectar incumplimientos y comparar intervenciones con criterios objetivos.
- Procesamiento por lotes de grabaciones cortas: con `max_inference_batch_size=16` y `max_new_tokens=256`, encaja en pipelines que procesan grandes volúmenes de clips de hasta 20 segundos.
- Transcripción de voz en aplicaciones de servicio al cliente coreanas: integrable vía `transformers` en servicios backend que ya usan el ecosistema Qwen.

## Benchmarks y rendimiento

Evaluación independiente Step 5b (2026-10-29), comparación de 2 brazos entre el base original y el checkpoint liberado (checkpoint-1200). Decodificación greedy (temperatura 0), 3 repeticiones por emisión; CER y RTF como mediana de las 3 repeticiones.

| Puerta | Conjunto (alcance) | Métrica | Base | Candidato | Regla | Resultado |
|---|---|---|---|---|---|---|
| A1 | TEST-D — telefonía/상담 (900 emisiones) | CER | 6,88 % | 6,07 % | cand ≤ base | Pasa (−0,80 pp; −11,6 % rel.) |
| A1 | TEST-E — numérico/숫자 (250 emisiones) | CER | 6,83 % | 6,35 % | cand ≤ base | Pasa (−0,48 pp; −7,1 % rel.) |
| B1 | TEST-C — general (456 emisiones) | CER | 3,46 % | 1,95 % | cand ≤ base + 0,5 pp | Pasa (−1,51 pp; −43,7 % rel.) |
| C1 | TEST-E ∪ TEST-C — 981 emisiones numéricas (×3 rep.) | tasa robusta number v2 | 66,4 % | 88,7 % | cand ≥ base | Pasa (+22,3 pp) |
| C2 | TEST-E ∪ TEST-C | recuento de errores plausibles pero incorrectos | 12 | 6 | cand ≤ base | Pasa |
| C3 | TEST-C / D / E | recuento de runaway y RTF | 0 / 0,104–0,134 | 0 / 0,109–0,138 | runaway cand ≤ base y RTF cand ≤ base × 1,10 | Pasa |

Histórico de evaluación: en la Step 5 sellada (2026-10-28) el candidato falló 1 de 5 puertas (C3, runaway en una única emisión de 20,45 s, TD-z065, por un margen de 2 caracteres), lo que dio NO-GO. La Step 5b, con conjuntos independientes nuevos y congelados, superó las cinco puertas y dio GO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2.038.052.480 parámetros y pesos en bfloat16, la carga del modelo requiere del orden de 4 GB solo para los pesos, más memoria para activaciones y caché de audio.
- GPU recomendadas: no especificadas en la información disponible. El ejemplo de la model card usa `device_map="cuda:0"` con `dtype=torch.bfloat16`.
- GPU de consumo: no confirmado por el autor; por tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con el paquete `qwen-asr` (`Qwen3ASRModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF medido de 0,109–0,138 según conjunto (frente a 0,104–0,134 del base), es decir, entre 7 y 9 veces más rápido que tiempo real en el hardware de evaluación no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Thaki-ASR-KO-1.7B | 2.038.052.480 | ≤ 20 s (evaluado) | coreano | Apache-2.0 | Ajuste fino especializado en telefonía y números |
| Qwen/Qwen3-ASR-1.7B | ~1,7 B (base) | no disponible | 30 idiomas | Apache-2.0 | Modelo base; CER 6,88 % en telefonía y 3,46 % en general |
| Otros modelos ASR coreanos | no disponible | no disponible | coreano | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Alcance de audio: todas las cifras publicadas corresponden a emisiones de 20 segundos o menos; el autor no garantiza ni reclama rendimiento en audio más largo.
- Idioma: el modelo espera entrada en coreano; para otros idiomas debe usarse el modelo base Qwen3-ASR-1.7B.
- Riesgo de alucinación: se documenta un caso de salida desbordada (runaway) en una emisión de 20,45 s durante la Step 5, con texto conversacional generado de más; aunque la Step 5b no reprodujo el fallo, el riesgo persiste en audio de duración límite.
- Errores plausibles pero incorrectos: aunque se reducen a la mitad (de 12 a 6), siguen existiendo y son especialmente sensibles en contextos numéricos.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio no incluye datos de entrenamiento ni de evaluación; los conjuntos KtelSpeech y el conjunto general son internos y no redistribuibles.
- Producción: la model card no ofrece garantías de rendimiento fuera de las condiciones evaluadas; conviene validar con datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-ASR-KO-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/Thaki-ASR-KO-1.7B/blob/main/MODEL_CARD.ko.md
- Dataset Zeroth-Korean: https://huggingface.co/datasets/Bingsu/zeroth-korean
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
