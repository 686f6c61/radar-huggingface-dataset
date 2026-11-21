# Tsengel-mn/nllb-mongolian

## Resumen

NLLB-600M Mongolian v2.5, publicado por Tsengel-mn, es un modelo de traducción automática neuronal bidireccional especializado en mongol (cirílico khalkha) ↔ inglés. Se obtiene mediante ajuste fino del modelo distilled de Meta NLLB-200 de 600M de parámetros, una arquitectura seq2seq transformer (m2m_100) orientada a traducción multilingüe. El modelo resuelve el problema de la baja calidad de traducción hacia y desde mongol en modelos multilingües genéricos, un idioma de bajos recursos con morfología aglutinante y armonía vocálica que los modelos generalistas suelen tratar deficientemente.

La versión 2.5 se entrena sobre más de 846.320 pares de frases paralelas e incorpora un corpus de gramática mongola (471 temas lingüísticos, 5.970 cuádruples verificados) sobremuestreado 20 veces. El autor declara mejoras en métricas morfológicas ChrF2++ y alineación de tokens respecto a la versión 2.0, así como latencia de inferencia en CPU INT8 por debajo de 150 ms mediante CTranslate2.

El modelo se distribuye con licencia GPL-3.0 y hereda las restricciones no comerciales de NLLB (CC-BY-NC 4.0), lo que limita su uso comercial sin permiso escrito del autor. Está pensado para despliegue en entornos con recursos limitados, incluidos servidores sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (m2m_100, NLLB-200 distilled 600M) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (CTranslate2); otros no disponibles |
| Idiomas soportados | mongol (khalkha cirílico, `khk_Cyrl`) e inglés (`eng_Latn`) |
| Licencia | GPL-3.0 y CC-BY-NC 4.0 (restricciones no comerciales heredadas de NLLB) |
| Formato de pesos | safetensors (Transformers); variante CTranslate2 INT8 |

## Arquitectura y entrenamiento

El modelo parte de NLLB-200 distilled 600M, un transformer encoder-decoder con atención completa y tokenización multilingüe basada en SentencePiece, originalmente entrenado por Meta para traducción entre 200 idiomas. El ajuste fino se realiza sobre más de 846.320 pares paralelos mongol-inglés, con inyección curricular de un corpus gramatical propio (Sovereign Mongolian Grammar Multi-Script Corpus) compuesto por 471 temas lingüísticos y 5.970 cuádruples verificados, sobremuestreado 20 veces. El objetivo declarado es reforzar las declinaciones de caso, la armonía vocálica de cuatro grados y las estructuras idiomáticas nativas, reduciendo calcos léxicos.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona el uso de tokens de idioma (`eng_Latn`, `khk_Cyrl`) para forzar el idioma destino mediante `forced_bos_token_id`, siguiendo el esquema estándar de NLLB. Se ofrece además una variante convertida a CTranslate2 en INT8 para inferencia rápida en CPU.

## Capacidades

- Traducción bidireccional inglés → mongol (cirílico khalkha) y mongol → inglés.
- Generación de traducciones con control explícito del idioma destino mediante tokens de idioma NLLB.
- Manejo de terminología técnica y de software (la model card incluye ejemplos sobre servidores, bases de datos y robótica).
- Refuerzo de morfología mongola: declinaciones de caso, armonía vocálica y estructuras idiomáticas nativas.
- Inferencia rápida en CPU mediante CTranslate2 INT8 (latencia declarada de 123,0–132,8 ms).
- No se declara soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada a los dos idiomas indicados (mn, en).

## Casos de uso

- Traducción de documentación técnica y software: el modelo traduce textos sobre servidores, bases de datos y desarrollo directamente entre inglés y mongol, lo que permite localizar manuales y notas de versión para equipos mongolohablantes.
- Atención al cliente en mongol: integrado en un backend de chat, traduce consultas de usuarios mongoles al inglés para su procesamiento y devuelve la respuesta traducida al mongol, con latencia inferior a 150 ms en CPU.
- Localización de interfaces y contenidos web: traducción por lotes de cadenas de interfaz y artículos, adecuada por su bajo coste de despliegue en servidores sin GPU.
- Traducción de documentación administrativa y educativa: útil para organizaciones públicas y educativas que necesitan convertir materiales entre inglés y mongol respetando la gramática formal.
- Procesamiento de corpus y minería de datos: traducción de grandes volúmenes de texto mongol a inglés para análisis, búsqueda o entrenamiento de otros sistemas.
- Despliegue en entornos con recursos limitados: la variante CTranslate2 INT8 permite ejecutar el modelo en CPU en servidores modestos o en el borde, sin depender de GPU.
- Subtitulado y transcripción bilingüe: traducción de segmentos cortos de conversación en pipelines de subtitulado automático.

## Benchmarks y rendimiento

Resultados declarados por el autor en el Sovereign Mongolian Grammar Bench (471 temas, 5.970 cuádruples), comparando v2.5 con la versión 2.0:

| Metrica | Baseline / v2.0 | v2.5 | Mejora relativa |
|---|---|---|---|
| EN → MN Morphological ChrF2++ | 36,52 % | 42,19 % | +5,67 % |
| EN → MN Token Alignment F1 | 29,26 % | 36,52 % | +7,26 % |
| EN → MN Exact Lemma Match | 5,3 % (8/150) | 10,0 % (15/150) | +88 % |
| MN → EN Morphological ChrF2++ | 32,23 % | 36,68 % | +4,45 % |
| MN → EN Token Alignment F1 | 35,08 % | 42,78 % | +7,70 % |
| MN → EN Exact Lemma Match | 7,3 % (11/150) | 10,7 % (16/150) | +46,5 % |
| Latencia de inferencia (CPU INT8) | 172,4 ms | 123,0–132,8 ms | inferior a 150 ms |

No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K, BLEU en WMT, FLORES-200) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,5 GB (615M parámetros); en FP16, alrededor de 1,3 GB.
- En INT8 con CTranslate2, el modelo puede ejecutarse en CPU sin GPU, con latencia declarada de 123,0–132,8 ms por segmento.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para FP32 se recomienda al menos 6 GB.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y superiores.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (INT8), y potencialmente servidores compatibles con modelos seq2seq; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Throughput estimado: no disponible; solo se declara latencia por segmento en CPU INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NLLB-600M Mongolian v2.5 (este) | 615M | mn, en | no disponible | GPL-3.0 + CC-BY-NC 4.0 | Hugging Face |
| Meta NLLB-200 distilled 600M | 600M | 200 idiomas | no disponible | CC-BY-NC 4.0 | Hugging Face |
| Meta NLLB-200 1.3B | 1,3B | 200 idiomas | no disponible | CC-BY-NC 4.0 | Hugging Face |
| Helsinki-NLP opus-mt-en-mn | no disponible | en, mn | no disponible | no disponible | Hugging Face |

La ventaja principal de este modelo frente a NLLB-200 genérico es el ajuste específico para mongol con refuerzo gramatical declarado; frente a opus-mt, ofrece una base de mayor tamaño y una variante optimizada para CPU. No se dispone de comparaciones directas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al derivar de NLLB-200, puede heredar sesgos de los datos multilingües originales de Meta.
- Riesgo de alucinación: en traducción automática, puede producir traducciones fluidas pero incorrectas en frases ambiguas, terminología muy especializada o textos con estructura atípica.
- Limitaciones de idioma: solo cubre mongol (khalkha cirílico) e inglés; no soporta otros dialectos mongoles ni escrituras distintas del cirílico.
- Longitud de contexto: no documentada; el uso está orientado a segmentos de frase, no a documentos largos.
- Restricciones de licencia: GPL-3.0 combinada con CC-BY-NC 4.0 de NLLB; el uso comercial, la reventa o la redistribución propietaria requieren permiso escrito del autor. Esto limita su integración en productos comerciales cerrados.
- Métricas declaradas por el propio autor sobre un benchmark propio (Sovereign Mongolian Grammar Bench), sin validación externa independiente; los resultados no son directamente comparables con benchmarks estándar como FLORES-200.
- El modelo tiene muy pocas descargas (110) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- Para producción, conviene evaluar la calidad en el dominio concreto antes de desplegar, dado que no hay resultados en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tsengel-mn/nllb-mongolian
- Variante CTranslate2 INT8: https://huggingface.co/Tsengel-mn/nllb-600m-mongolian-ct2-int8
- Sitio del autor: https://tsengel.de
- Ecosistema "Mongolian Language for All": https://github.com/Tsengel-de
- NLLB-200 (modelo base de Meta): no disponible en la información proporcionada
