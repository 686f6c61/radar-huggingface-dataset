# TigreGotico/nllb_200_distilled_600m-eng-zul-onnx

## Resumen

`nllb_200_distilled_600m-eng-zul-onnx` es la exportación a formato ONNX del modelo de traducción `dsfsi/nllb_200_distilled_600m-eng-zul`, un ajuste fino de `facebook/nllb-200-distilled-600M` realizado por el grupo DSFSI (Data Science for Social Impact) de la Universidad de Pretoria, especializado en recursos lingüísticos para lenguas africanas. El modelo traduce exclusivamente en la dirección inglés (en) a zulú (zu), una de las lenguas bantúes con mayor número de hablantes de Sudáfrica. La exportación la firma TigreGotico, que únicamente convierte los pesos originales sin modificar el entrenamiento.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue en producción: los grafos ONNX con cuantización dinámica int8 reducen el tamaño del artefacto de 7,4 GB a 1,9 GB, manteniendo una calidad de traducción prácticamente idéntica en la medición realizada sobre FLORES-200 (chrF 54,51 en fp32 frente a 54,47 en int8). Para equipos que necesitan servir traducción en/zu en entornos con recursos limitados o con ONNX Runtime como motor de inferencia, este repositorio evita la dependencia de PyTorch y permite ejecución más ligera.

Arquitectura transformer encoder-decoder (familia M2M-100/NLLB) con aproximadamente 600 millones de parámetros y contexto de 1024 tokens, licencia Apache-2.0 y soporte únicamente para el par en→zu. No es un modelo multilingüe general: es un especialista de par de lenguas con una dirección fija.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, NLLB-200 distilled) |
| Parámetros totales | ~600 M (checkpoint NLLB-200 distilled 600M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (estándar de NLLB-200) |
| Tipos de cuantización | fp32 (grafo original) e int8 dinámica por canal (ONNX Runtime) |
| Idiomas soportados | Inglés (en, `eng_Latn`) → zulú (zu, `zul_Latn`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx` + `*.onnx_data`); int8 en subcarpeta `int8/` |

## Arquitectura y entrenamiento

El modelo base es `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo seq2seq derivado de la familia NLLB-200 (No Language Left Behind) de Meta, destilado desde el modelo de 54B parámetros. DSFSI realizó un ajuste fino sobre el dataset `afriscience-mt`, orientado a contenido científico y técnico en lenguas africanas, para especializar el par inglés→zulú. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el ajuste fino original.

La exportación ONNX se generó con `optimum-cli` usando la tarea `text2text-generation-with-past` y `--no-post-process`, lo que produce grafos separados para encoder, decoder y decoder con caché (past), con datos externos porque el checkpoint supera el límite de 2 GB por fichero protobuf. La cuantización int8 se aplicó con `quantize_dynamic` de ONNX Runtime (QInt8, per_channel, `EnableSubgraph`) sobre cada grafo de forma independiente, manteniendo los pesos en ficheros `.onnx_data` externos. La innovación técnica destacable es la paridad exacta del fp32 con el modelo PyTorch original (100% de coincidencia en 10 frases con greedy y beam=4) y la práctica equivalencia de calidad del int8 en FLORES-200.

## Capacidades

- Traducción automática inglés→zulú en dominio general y científico-técnico.
- Generación de texto seq2seq con decodificación greedy y beam search (beam=4 validado).
- Soporte de caché de decodificación (`use_cache=True`) para generación incremental.
- Control explícito del idioma destino mediante `forced_bos_token_id` con etiquetas FLORES (`zul_Latn`), no con códigos ISO 639-1.
- Ejecución en ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- No es multilingüe más allá del par en→zu; no traduce zu→en ni otros pares.

## Casos de uso

- Traducción de documentación técnica y científica al zulú: el ajuste fino sobre `afriscience-mt` hace que el modelo sea adecuado para material divulgativo y académico, donde el vocabulario especializado importa más que en conversación coloquial.
- Localización de interfaces y contenido web: integrado en un pipeline de publicación, permite traducir cadenas de UI y artículos del inglés al zulú con un coste de inferencia bajo gracias al grafo int8 de 1,9 GB.
- Servicio de traducción por API en entornos con recursos limitados: al ejecutarse en ONNX Runtime con int8, se puede desplegar en instancias CPU o GPU modestas sin cargar el stack completo de PyTorch.
- Traducción de comunicaciones institucionales y sanitarias: el zulú es una de las lenguas oficiales de Sudáfrica, y un modelo especializado en contenido formal resulta útil para administraciones y ONG que publican material en inglés y necesitan versión en zulú.
- Preprocesamiento en pipelines de NLP multilingüe: traducción en→zu como paso previo para análisis de sentimiento, extracción de entidades o indexación de contenido en zulú.
- Evaluación comparativa de motores de traducción: la paridad documentada fp32/int8 y las métricas FLORES permiten usar el modelo como referencia en estudios de cuantización o de despliegue ONNX.
- Traducción por lotes en procesos offline: el formato ONNX con datos externos facilita el procesamiento batch en servidores sin GPU dedicada.

## Benchmarks y rendimiento

Paridad fp32 frente al modelo PyTorch original (10 frases de dominio general, coincidencia exacta de cadena):

| Decodificación | fp32 (n=10) |
|---|---|
| Greedy | 100% (10/10) |
| Beam=4 | 100% (10/10) |

Calidad int8 frente a fp32 sobre las primeras 50 frases de FLORES-200 devtest (`eng_Latn`→`zul_Latn`, greedy, ONNX Runtime 1.31.1, chrF de corpus con sacrebleu):

| Build | Tamaño | chrF | Salidas idénticas a fp32 |
|---|---|---|---|
| fp32 | 7,4 GB | 54,51 | 50/50 |
| int8 | 1,9 GB | 54,47 | 25/50 |

El autor advierte explícitamente que la paridad con n=10 es una señal inicial ruidosa y no un benchmark a escala FLORES; en este proyecto se observó que métricas de coincidencia exacta con n=5 pueden pasar de 100% a 14% al remedir con n=100 en FLORES-200. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de traducción.

## Requisitos de hardware

- VRAM estimada para fp32: en torno a 3-4 GB para pesos (7,4 GB en disco incluye datos externos y overhead de grafos) más memoria de activaciones; cabe en GPUs consumer de 8 GB o más.
- VRAM estimada para int8: aproximadamente 2-2,5 GB de pesos; cabe en GPUs de 4-6 GB y en muchos casos se puede ejecutar en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime (RTX 3060/4060 en adelante, A10, L4, A100, H100); el modelo es pequeño y no requiere hardware de gama alta.
- Ejecución en CPU: viable con ONNX Runtime, especialmente con el grafo int8; el tamaño reducido lo hace apto para servidores sin GPU.
- Opciones de despliegue: ONNX Runtime (nativo o vía `optimum.onnxruntime.ORTModelForSeq2SeqLM`), servidores de inferencia compatibles con ONNX. No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos causales o requieren conversión adicional.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño de 600M y la decodificación seq2seq permiten estimar latencias de decenas de milisegundos por frase en GPU, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Calidad en/zu |
|---|---|---|---|---|---|---|
| Este modelo (int8) | ~600 M | 1024 | en→zu | Apache-2.0 | ONNX int8 | chrF 54,47 (FLORES-200, 50 frases) |
| `dsfsi/nllb_200_distilled_600m-eng-zul` (original) | ~600 M | 1024 | en→zu | Apache-2.0 | PyTorch/safetensors | Referencia del ajuste fino; sin métricas publicadas en la información disponible |
| `facebook/nllb-200-distilled-600M` | ~600 M | 1024 | 200 lenguas | CC-BY-NC-4.0 | PyTorch/safetensors | Multilingüe general; calidad en/zu inferior al ajuste fino específico, sin medición disponible |
| `facebook/nllb-200-3.3B` | ~3,3 B | 1024 | 200 lenguas | CC-BY-NC-4.0 | PyTorch/safetensors | Mayor capacidad general, pero licencia no comercial y mayor coste de despliegue |

La ventaja diferencial de este repositorio es la combinación de licencia Apache-2.0 (frente a la CC-BY-NC de NLLB original), especialización en el par en→zu y artefacto ONNX int8 listo para producción. La desventaja es que solo cubre una dirección y un par de lenguas.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce inglés→zulú; no soporta zu→en ni otros pares.
- Requiere pasar `forced_bos_token_id` con la etiqueta FLORES `zul_Latn` en cada llamada; el idioma destino no está fijado en `generation_config.json`, lo que puede provocar errores si se asume un comportamiento tipo M2M100.
- La paridad fp32 con el original se midió con n=10 frases; es una estimación ruidosa y no sustituye a una evaluación FLORES con chrF/BLEU a escala completa.
- El int8 solo reproduce exactamente 25 de 50 salidas del fp32 en FLORES-200, aunque la diferencia de chrF es mínima (0,04 puntos); para aplicaciones que exijan determinismo bit a bit, usar fp32.
- Riesgo de alucinación y de traducciones literales en dominios alejados del dataset de ajuste fino (`afriscience-mt`), especialmente en lenguaje coloquial, jerga o variantes dialectales del zulú.
- Sesgos potenciales heredados de NLLB-200 y del corpus de ajuste fino; no se documenta auditoría de sesgos en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base NLLB-200 de Meta se distribuye bajo CC-BY-NC-4.0; conviene revisar la cadena de licencias antes de un despliegue comercial (el autor declara Apache-2.0 para este repositorio).
- El repositorio ocupa 15,1 GB, aunque el artefacto int8 útil son 1,9 GB; descargar solo la subcarpeta `int8/` si no se necesita fp32.
- Sin soporte documentado para vLLM, TGI u otros servidores de alto throughput; el despliegue se limita a ONNX Runtime o envoltorios compatibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-eng-zul-onnx
- Modelo base (ajuste fino original): https://huggingface.co/dsfsi/nllb_200_distilled_600m-eng-zul
- Modelo NLLB-200 distilled 600M de Meta: https://huggingface.co/facebook/nllb-200-distilled-600M
- Grupo DSFSI (Universidad de Pretoria): https://dsfsi.github.io/
- Repositorio de scripts de exportación y cuantización: https://github.com/TigreGotico/linguonnx
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Dataset FLORES-200: https://github.com/facebookresearch/flores
- Documentación de Optimum ONNX: https://huggingface.co/docs/optimum/exporters/onnx/overview
