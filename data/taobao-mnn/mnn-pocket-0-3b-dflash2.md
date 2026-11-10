# taobao-mnn/MNN-Pocket-0.3B-DFlash2

## Resumen

MNN-Pocket-0.3B-DFlash2 es un modelo borrador (*draft model*) de decodificación especulativa desarrollado por el equipo taobao-mnn de Alibaba, diseñado para acelerar la inferencia del modelo objetivo MNN-Pocket-0.3B sobre el runtime MNN en dispositivos móviles. No es un modelo de chat autónomo: su única función es proponer bloques de tokens que el modelo objetivo verifica en una sola pasada, reduciendo el número de pasos autorregresivos necesarios para generar una secuencia.

La innovación principal es el esquema DFlash2, que en lugar de proponer un token por paso genera un bloque completo de B = 8 tokens en un único forward del borrador. El borrador es extremadamente compacto: 3 capas, tamaño oculto 896, atención GQA con 14 cabezas y 2 cabezas KV, y aproximadamente 130 MB en BF16. Comparte el embedding de tokens y la LM head con el modelo objetivo, por lo que no duplica la proyección de vocabulario (65.536 entradas).

Es relevante ahora porque permite obtener aceleraciones medias de 1,65x en iPad Pro (M5) y 1,15x en Snapdragon 8 Gen 5 frente a decodificación autorregresiva con el mismo objetivo cuantizado a INT4, con picos de 2,06x en cargas de código. El repositorio pesa 0,1 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en pipelines de inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel, decoder-only, 3 capas |
| Parametros totales | 65.180.032 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 embeddings posicionales |
| Tipos de cuantizacion | BF16 (pesos publicados) e INT4 (variante entrenada y evaluada) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ~130 MB) |

Detalles adicionales de arquitectura: tamaño oculto 896, 14 cabezas de atención con 2 cabezas KV (GQA), head_dim 64, FFN intermedio 2560 con activación SiLU, vocabulario de borrador 65.536 compartido con el objetivo, tamaño de bloque 8 tokens por pasada. Configuración DFlash: `conv_kernel_size` 2, `conv_group_size` 16, `selector_rank` 256, `selector_top_k` 16, `mask_token_id` 65521. El borrador toma activaciones de las capas [1, 7, 13, 19, 25] del modelo objetivo de 28 capas.

## Arquitectura y entrenamiento

El borrador es un transformer decoder-only de 3 capas que se ejecuta en paralelo al modelo objetivo y consume activaciones intermedias de cinco capas del objetivo (`target_layer_ids` [1, 7, 13, 19, 25]). En cada ronda de decodificación genera un bloque de 8 tokens candidatos en un solo forward, que el modelo objetivo verifica de forma paralela; los tokens aceptados se incorporan a la secuencia y se descartan los rechazados. La longitud media aceptada ronda los 4,6 tokens por ronda según la model card.

El entrenamiento se realizó con SpecForge sobre prompts de Open-PerfectBlend más 500.000 muestras de post-entrenamiento, empleando la pérdida con ponderación posicional de D-PACE. Se publican dos variantes: una entrenada contra el objetivo en precisión completa (MNN) y otra entrenada contra el objetivo cuantizado con QAT INT4 (MNN-INT4); esta última recupera la mayor parte de la aceptación perdida al verificar con un objetivo cuantizado (1,06% de diferencia en BF16 y 1,94% en INT4 bajo verificador MNN-INT4). El borrador reutiliza el tokenizador del objetivo y no incluye uno propio.

## Capacidades

- Generación de propuestas de bloques de 8 tokens para decodificación especulativa, no generación de texto autónoma.
- Verificación compatible con objetivo en precisión completa (MNN) y con objetivo cuantizado INT4 (MNN-INT4).
- Aceleración especialmente marcada en cargas de código (longitud aceptada media 5,73-5,83) y matemáticas (4,49-4,59).
- Rendimiento moderado en chat y conversación (longitud aceptada media 3,18-3,70).
- Soporte de contexto hasta 40.960 posiciones.
- Idiomas: inglés y chino, heredados del modelo objetivo.
- Integración con el runtime de decodificación especulativa de MNN en dispositivos Apple y Android.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; esas capacidades dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en móvil para asistentes de chat: el borrador se despliega junto al objetivo MNN-Pocket-0.3B en el runtime MNN y reduce el número de pasos autorregresivos; en chat la ganancia es modesta (1,26x en iPad Pro M5, 0,88x en Snapdragon 8 Gen 5), por lo que conviene evaluar por carga.
- Generación de código en el dispositivo: con longitud aceptada media de 5,73-5,83 tokens y hasta 2,06x de aceleración en iPad Pro M5, es adecuado para autocompletado y edición de código en entornos sin conectividad.
- Resolución de problemas matemáticos en el borde: 1,63x de aceleración en iPad Pro M5 y 1,17x en Snapdragon 8 Gen 5 sobre el objetivo INT4, útil para tutores o calculadoras asistidas offline.
- Aplicaciones de accesibilidad con latencia crítica: la reducción de pasos de decodificación disminuye el tiempo hasta el primer bloque completo de tokens, lo que mejora la respuesta percibida en dictado o lectura asistida.
- Despliegue en dispositivos con memoria limitada: el borrador ocupa unos 130 MB en BF16 y comparte embedding y LM head con el objetivo, por lo que el coste adicional de memoria es reducido frente a alternativas que duplican el vocabulario.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el equilibrio entre tamaño de bloque, longitud aceptada y aceleración real en hardware móvil, con configuraciones DFlash2 documentadas.
- Pipelines de inferencia híbridos borde-nube: el borrador puede usarse en el dispositivo para generar borradores y delegar la verificación en una instancia del objetivo, reduciendo el tráfico de tokens en escenarios de conectividad intermitente.

## Benchmarks y rendimiento

Longitud media aceptada por ronda de decodificación (mayor es mejor), sobre seis benchmarks de solo prompt:

| Precision borrador | Origen entrenamiento | Verificador | MATH-500 | AIME25 | MBPP | HumanEval | MT-Bench | Arena-Hard | Media |
|---|---|---|---|---|---|---|---|---|---|
| BF16 | MNN | MNN | 5,34 | 4,59 | 5,55 | 5,83 | 3,55 | 3,18 | 4,67 |
| BF16 | MNN | MNN-INT4 | 5,30 | 4,49 | 5,57 | 5,75 | 3,62 | 3,16 | 4,65 |
| BF16 | MNN-INT4 | MNN-INT4 | 5,34 | 4,55 | 5,64 | 5,82 | 3,70 | 3,18 | 4,70 |
| INT4 | MNN | MNN-INT4 | 5,16 | 4,37 | 5,48 | 5,65 | 3,50 | 3,06 | 4,54 |
| INT4 | MNN-INT4 | MNN-INT4 | 5,22 | 4,47 | 5,55 | 5,76 | 3,65 | 3,10 | 4,63 |

Aceleración en dispositivo con objetivo MNN-INT4 y borrador INT4 entrenado contra MNN (longitud máxima de generación 256):

| Dispositivo | Carga | AR tok/s | Longitud aceptada media | Spec. tok/s | Aceleración |
|---|---|---|---|---|---|
| iPad Pro (M5) | Matemáticas | 435 | 4,49 | 709 | 1,63x |
| iPad Pro (M5) | Código | 435 | 5,73 | 895 | 2,06x |
| iPad Pro (M5) | Chat | 435 | 3,51 | 547 | 1,26x |
| iPad Pro (M5) | Media | 435 | 4,57 | 717 | 1,65x |
| Android (8 Gen 5) | Matemáticas | 135 | 4,48 | 159 | 1,17x |
| Android (8 Gen 5) | Código | 135 | 5,72 | 186 | 1,38x |
| Android (8 Gen 5) | Chat | 135 | 3,49 | 119 | 0,88x |
| Android (8 Gen 5) | Media | 135 | 4,56 | 155 | 1,15x |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval como evaluación de capacidad, GSM8K) en la información disponible, ya que el borrador no se evalúa como generador autónomo.

## Requisitos de hardware

- VRAM/memoria estimada: unos 130 MB para los pesos del borrador en BF16; en INT4, aproximadamente 65 MB (estimación por cuantización a 4 bits, no confirmada en la model card).
- Memoria total: debe sumarse la del objetivo MNN-Pocket-0.3B (28 capas) en BF16 o INT4; el borrador comparte embedding y LM head, por lo que no añade esa proyección.
- GPU/dispositivos recomendados: iPad Pro con chip M5 y Android con Snapdragon 8 Gen 5 son las plataformas con cifras publicadas; el runtime MNN también soporta CPU y GPU móviles, pero no se han publicado cifras para otros chips.
- Cabe en hardware de consumo: sí, por su tamaño (130 MB), aunque el requisito real lo marca el modelo objetivo y el runtime MNN.
- Opciones de despliegue: runtime de decodificación especulativa de MNN junto al objetivo MNN-Pocket-0.3B-MNN; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 717 tok/s de media en iPad Pro M5 (frente a 435 en autorregresivo) y 155 tok/s en Snapdragon 8 Gen 5 (frente a 135), con lote 1, decodificación greedy y longitud máxima 256.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-DFlash2 | Borrador especulativo DFlash2 para MNN-Pocket-0.3B | 65.180.032 | 40.960 | Apache 2.0 | Hugging Face, runtime MNN |
| MNN-Pocket-0.3B | Modelo objetivo de chat, 28 capas | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Hugging Face, runtime MNN |
| Borradores EAGLE/Medusa genéricos | Borradores especulativos para transformers | variable | variable | variable | no disponible en la informacion |

La model card no proporciona comparaciones directas con otros borradores especulativos; los datos anteriores se limitan a lo indicado en la información disponible.

## Limitaciones y advertencias

- No es un modelo de chat autónomo: genera propuestas que deben verificarse con MNN-Pocket-0.3B; usarlo solo produce salidas sin garantía de corrección.
- Dependencia estricta del runtime MNN y del modelo objetivo concreto; no se documenta compatibilidad con otros motores de inferencia.
- Idiomas limitados a inglés y chino; no hay evidencia de calidad en castellano.
- La aceleración es muy dependiente de la carga y del dispositivo: en chat sobre Snapdragon 8 Gen 5 se observa una desaceleración (0,88x), por lo que conviene medir por caso de uso.
- El borrador entrenado contra el objetivo en precisión completa pierde aceptación al verificar con objetivo INT4 (hasta 1,94% en INT4); para producción con cuantización conviene usar la variante entrenada contra MNN-INT4.
- Riesgo de alucinación y sesgos heredado del modelo objetivo; el borrador no los corrige.
- No incluye tokenizador propio: requiere el tokenizador del objetivo, lo que complica su uso aislado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo objetivo y del runtime MNN en producción.
- Las cifras de aceleración se obtuvieron con lote 1, greedy y 256 tokens máximos; otros regímenes de decodificación (muestreo, lotes mayores) no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-DFlash2
- Modelo objetivo MNN-Pocket-0.3B: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket-0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.12311
- Modelo objetivo en formato MNN: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- README en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-DFlash2/blob/main/README-cn.md
- Demo en vídeo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
