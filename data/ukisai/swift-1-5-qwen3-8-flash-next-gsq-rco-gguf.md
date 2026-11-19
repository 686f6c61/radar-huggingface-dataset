# ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next GSQ-RCO es una familia de cuantizaciones GGUF en precisión mixta del modelo Swift Flash Next, un derivado de Qwen3.8-Flash-Next desarrollado por UkisAI. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 176.943.899.520 parámetros totales, afinado mediante post-entrenamiento para reducir la longitud de las trazas de razonamiento y mejorar tareas de código, agentes y horizontes largos. Esta publicación no distribuye los pesos originales, sino cinco perfiles de cuantización (IQ3_S_G8, IQ3_S, IQ3_XXS, IQ2_XS y Q2_0) pensados para ejecución en llama.cpp.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 177.000 millones de parámetros en hardware de gama alta para consumidores y estaciones de trabajo, algo imposible con los pesos en BF16. El autor reporta que el modelo base consume un 63,4 % menos de tokens de pensamiento con una aceleración de 1,8x y una pérdida de precisión inferior al 1 % frente al modelo base en el ajuste xhigh. La cuantización incorpora refinamiento GSQ específico de Swift y reutiliza perfiles de asignación por tensor GSQ-RCO de ISTA.

El pipeline declarado es image-text-to-text, con un proyector de visión BF16 separado de 0,91 GB, aunque las mediciones publicadas de la cuantización cubren únicamente inferencia de texto. La licencia es swift-open-license-1.0, propietaria y con condiciones de acceso empresarial, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal (Gated DeltaNet) en 36 capas |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (evaluado hasta 32K en mediciones de KLD) |
| Tipos de cuantización | IQ3_S_G8, IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (experimental) |
| Idiomas soportados | no disponible (evaluado en inglés, alemán, francés, español y chino) |
| Licencia | swift-open-license-1.0 (other) |
| Formato de pesos | GGUF (dos shards por tier) + proyector de visión BF16 GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 36 capas de atención lineal del tipo Gated DeltaNet, cuyas 108 matrices de pesos son tratadas de forma especial en el tier G8 (cuantizadas a Q8_0 mientras el resto de tensores permanece idéntico a IQ3_S). No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en la información proporcionada; la model card remite a la ficha del modelo original para los detalles de entrenamiento.

La innovación técnica de esta publicación es la cuantización: perfiles de asignación de precisión por tensor GSQ-RCO, con refinamiento GSQ específico del modelo y reutilización de los perfiles de ISTA. El tier G8 está pensado como archivo por defecto del motor Swift (acceso anticipado por invitación) para máquinas de 128 GB. Se incluyen archivos de recuperación exacta que permiten reconstruir byte a byte los GGUF originales sin dividir, con los cuatro hashes verificados antes de la publicación. El post-entrenamiento del modelo base se orienta a eficiencia de tokens ("efficient-thinking") y reducción de trazas de razonamiento.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) eficiente en tokens.
- Generación de código, con conjuntos de evaluación específicos sobre CodeParrot.
- Razonamiento matemático, evaluado sobre texto de GSM8K.
- Capacidades multimodales de imagen a texto mediante el proyector de visión BF16 separado (0,91 GB); la precisión en tareas de visión no está medida en esta publicación.
- Soporte multilingüe evaluado en inglés, alemán, francés, español y chino.
- Tareas agénticas y de horizonte largo, según los objetivos declarados del post-entrenamiento.
- Compatibilidad con llama.cpp y con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de razonamiento a gran escala: con el tier IQ2_XS (68,15 GB) el modelo cabe en estaciones de trabajo con 96-128 GB de memoria unificada, permitiendo razonamiento de un MoE de 177.000 millones de parámetros sin infraestructura de centro de datos.
- Asistentes de código en pipelines de CI/CD: el modelo base está post-entrenado para tareas de código y el tier IQ3_S mantiene un KLD de 0,069016 sobre CodeParrot, adecuado para revisión automática de parches y generación de tests.
- Razonamiento matemático en producción: el KLD de 0,054960 en GSM8K para IQ3_S indica que la cuantización preserva bien la distribución en texto matemático, útil para tutores y verificación de cálculos.
- Atención al cliente multilingüe: los KLD medidos en español (0,042848 en IQ3_S) y francés (0,076760) son los más bajos del conjunto, lo que respalda su uso en conversaciones multi-turno en estos idiomas.
- Procesamiento de documentos con imagen: gracias al proyector de visión BF16 se pueden extraer y razonar sobre contenido de capturas y páginas escaneadas, aunque la calidad en visión no está cuantificada.
- Investigación sobre cuantización: los perfiles GSQ-RCO y los archivos de recuperación exacta permiten reproducir y comparar metodologías de cuantización por tensor con divergencia KL medida.
- Agentes de horizonte largo: el objetivo declarado de eficiencia de tokens (63,4 % menos tokens de pensamiento) reduce el coste por tarea en bucles agénticos de varios pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Las mediciones publicadas son de divergencia KL frente al modelo BF16, no de precisión en tareas.

| Conjunto de evaluación (contexto 512) | IQ3_S | IQ3_XXS | IQ2_XS | Q2_0 |
|---|---:|---:|---:|---:|
| KLD desarrollo global | 0,144674 | 0,240139 | 0,341275 | 0,424350 |
| Prosa inglesa | 0,062556 | 0,116077 | 0,188117 | 0,234242 |
| Muestra inglesa fresca (C4) | 0,067801 | — | 0,186271 | 0,236228 |
| Código (CodeParrot) | 0,069016 | 0,118707 | 0,174294 | 0,235256 |
| Matemáticas (GSM8K) | 0,054960 | 0,086821 | 0,120991 | 0,149809 |
| Alemán | 0,063634 | 0,109100 | 0,166814 | 0,219444 |
| Francés | 0,076760 | 0,133624 | 0,213379 | 0,300467 |
| Español | 0,042848 | 0,073681 | 0,119114 | 0,148757 |
| Chino | 0,095915 | 0,174102 | 0,264923 | 0,385924 |

Mediciones adicionales de G8 frente a IQ3_S (KL a BF16 de Swift, 2026-11-16): wikitext-2 a 2K de contexto 0,0933 frente a 0,0942; a 32K 0,1075 frente a 0,1061; textos de referencia propios a 2K/8K/32K 0,0169/0,0164/0,0273 frente a 0,0173/0,0167/0,0278.

## Requisitos de hardware

- VRAM/memoria estimada según tier (tamaño combinado de los dos shards, sin caché de contexto): Q2_0 66,55 GB; IQ2_XS 68,15 GB; IQ3_XXS 75,97 GB; IQ3_S 83,74 GB; IQ3_S_G8 84,42 GB. Añadir el proyector de visión (0,91 GB) si se usa multimodalidad.
- El tier G8 está diseñado explícitamente para máquinas de 128 GB de memoria unificada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, los tiers IQ2_XS e IQ3_XXS son los únicos candidatos realistas para configuraciones de una sola GPU de 80 GB, y el resto requiere memoria unificada o multi-GPU.
- No cabe en GPU de consumo convencionales (24 GB o menos) en ningún tier.
- Opciones de despliegue: llama.cpp (soporte declarado, carga del shard 1 y localización automática del shard 2); motor Swift en acceso anticipado por invitación; otros motores no disponibles en la información.
- Latencia y throughput: no disponible; el autor reporta una aceleración de 1,8x del modelo base frente a su base, no de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next GSQ-RCO (este) | 176.943.899.520 | no disponible | GGUF IQ3_S_G8 a Q2_0 | swift-open-license-1.0 | Hugging Face, 1.315.358 descargas |
| Swift-Qwen3.8-Flash-Next (BF16) | 176.943.899.520 | no disponible | BF16 | swift-open-license-1.0 | Hugging Face |
| Swift-1.5-Qwen3.8-Flash-Next-GGUF (GGUF estándar) | 176.943.899.520 | no disponible | GGUF estándar | swift-open-license-1.0 | Hugging Face |
| Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | no disponible | no disponible | referenciado como base |

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 es propietaria y contempla licencias empresariales; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Las métricas publicadas son de divergencia KL, no de precisión en tareas; no hay evidencia publicada de rendimiento en MMLU, HumanEval o GSM8K para esta cuantización.
- La evaluación cubre solo texto; no se mide la precisión en tareas de visión pese a incluirse el proyector multimodal.
- El tier Q2_0 está marcado como experimental y presenta el KLD más alto (0,424350), con degradación notable en chino (0,385924) y francés (0,300467).
- El chino es el idioma con mayor divergencia en todos los tiers; el rendimiento en idiomas no evaluados (incluido el portugués, el italiano o el japonés) es desconocido.
- El modelo base está optimizado para trazas de razonamiento cortas; esto puede reducir el rendimiento en tareas que requieren cadenas de pensamiento muy extensas.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada.
- El tier G8 depende del motor Swift en acceso anticipado por invitación; en llama.cpp su ventaja frente a IQ3_S no está garantizada.
- Los dos shards deben descargarse en el mismo directorio; la integridad debe verificarse con SHA256SUMS y release-manifest.json.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- GGUF estándar: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Motor Swift (acceso anticipado): https://github.com/UkisAI-EarlyAccess/swift.cpp-early-access
- Manifiesto de release: release-manifest.json (en el repositorio)
- Sumas de verificación: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Recuperación exacta de fuentes: exact-source-recovery/README.md (en el repositorio)
- Referencia arXiv 2604.18556: https://arxiv.org/abs/2604.18556
- Referencia arXiv 2605.00649: https://arxiv.org/abs/2605.00649
