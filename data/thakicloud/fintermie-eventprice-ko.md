# ThakiCloud/FinTermIE-EventPrice-KO

## Resumen

FinTermIE-EventPrice-KO es un modelo de extraccion de informacion financiera en coreano desarrollado por ThakiCloud. Se trata de un fine-tune completo de XLM-RoBERTa base (278 millones de parametros) con una cabeza de clasificacion de spans que lee la seccion narrativa de una divulgacion de ajuste de precio de conversion (조정근거 및 방법) y devuelve dos cifras: el precio antes del ajuste y el precio despues del mismo. Cubre bonos convertibles (전환가액), bonos con warrants (신주인수권 행사가액) y bonos canjeables (교환가액).

El modelo no genera texto libre. Un codigo deterministico enumera todos los numeros de la narrativa como candidatos; el modelo puntua cada candidato como "antes", "despues" o ninguno, y solo devuelve un valor si supera un umbral frente a una opcion de "no escrito". La respuesta es siempre uno de los numeros presentes en la entrada, acompanada de su span de caracteres, lo que elimina la posibilidad de inventar cifras.

Se publica como version experimental. En un conjunto de prueba pre-registrado de emisores nunca vistos en entrenamiento (258 divulgaciones de 134 emisores, 2019-2024), supero ampliamente a una linea base de reglas lexicas, pero fallo una puerta de seguridad pre-registrada: cuando el precio previo al ajuste no aparece escrito en el texto, respondio de todos modos en 3 de 46 documentos frente a 1 de 46 de la linea base. No hay garantia de precision para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de spans |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana, con stride de 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de FacebookAI/xlm-roberta-base, un encoder transformer multilingue de 278 millones de parametros, al que se anade una cabeza de rol de span de pequeno tamano. El pipeline es hibrido: primero, codigo deterministico identifica todos los numeros candidatos de la narrativa (numeros con separador de miles o numeros planos con tres o mas digitos enteros, omitiendo partes de fechas) y normaliza sus valores eliminando comas y ceros decimales finales (`6,050` → `6050`). Despues, el modelo puntua cada candidato como *before*, *after* o ninguno, y un valor solo se devuelve si supera un umbral frente a la opcion "no escrito".

El texto se procesa en ventanas de 512 tokens con stride de 128, y la puntuacion de un candidato es la de su mejor ventana. Los umbrales se envian en `eventprice_config.json` (before −1.0, after −1.5, sobre el margen entre un candidato y la opcion "no escrito") y se eligieron unicamente sobre el conjunto de desarrollo. La regla de desambiguacion es "un span, un rol": si ambos campos seleccionan el mismo span, lo conserva el campo con mayor margen. La entrada debe ser exclusivamente el texto narrativo, nunca la tabla de la divulgacion, ya que la tabla es la fuente de las etiquetas de entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extraccion de spans de precio en narrativas financieras coreanas: identifica el precio antes y despues del ajuste de conversion.
- Cobertura de tres instrumentos: bonos convertibles (전환가액), bonos con warrants (신주인수권 행사가액) y bonos canjeables (교환가액).
- Abstencion calibrada: devuelve `None` para un campo cuando el precio no esta escrito en la narrativa, mediante umbrales sobre el margen frente a la opcion "no escrito".
- Respuesta anclada al texto: la salida es siempre uno de los numeros de la entrada, con sus offsets de caracteres (`before_span`, `after_span`), lo que impide la invencion de cifras.
- Procesamiento de documentos largos mediante ventanas de 512 tokens con solapamiento.
- Normalizacion de valores numericos (eliminacion de comas y ceros decimales finales).
- No genera texto libre, no soporta tool calling, no tiene modo de razonamiento multi-paso y no procesa vision ni audio.

## Casos de uso

- Extraccion automatizada de precios en pipelines de datos financieros: el modelo lee la seccion 조정근거 및 방법 de divulgaciones DART y devuelve las cifras antes/despues con sus spans, permitiendo poblar bases de datos estructuradas de ajustes de precio de conversion sin intervencion manual.
- Auditoria y verificacion documental: al devolver siempre un numero presente en el texto junto con su offset, un revisor humano puede localizar la cifra exacta en el documento original y validarla, lo que encaja en flujos de compliance donde la trazabilidad es obligatoria.
- Monitorizacion de eventos corporativos: integrado en un sistema que vigila nuevas divulgaciones de bonos convertibles, canjeables o con warrants, el modelo extrae los precios ajustados para disparar alertas o recalcular metricas de dilucion.
- Enriquecimiento de datasets de investigacion: para investigadores que construyen corpus de eventos financieros coreanos, el modelo permite anotar automaticamente pares antes/despues a partir de narrativas, con la posibilidad de filtrar por margen de confianza.
- Preprocesamiento para modelos mayores: dado su reducido tamano (278M), puede actuar como extractor de primera pasada que alimente a un LLM mayor o a un sistema de reglas, reduciendo el coste computacional en volumenes altos de documentos.
- Clasificacion de calidad documental: la tasa de abstencion y los margenes devueltos permiten detectar divulgaciones cuya narrativa no contiene las cifras esperadas, señalando documentos que requieren revision manual o que siguen formatos atipicos.

## Benchmarks y rendimiento

Conjunto de prueba E-Issuer: 258 divulgaciones de 134 emisores, presentadas entre 2019 y 2024, ninguno de ellos presente en entrenamiento, desarrollo ni en los documentos usados para construir la linea base de reglas. La exactitud es la proporcion de documentos en los que el valor devuelto coincide con el de la tabla de la propia divulgacion. El techo es 0.82 para *before* (212 de 258 son respondibles) y 0.97 para *after* (250 de 258).

| Sistema | Exactitud *before* [IC 95%] | Exactitud *after* [IC 95%] |
|---|---|---|
| Este modelo | 0.798 [0.731, 0.863] | 0.938 [0.900, 0.969] |
| Rule baseline v1 (reglas lexicas) | 0.601 [0.523, 0.679] | 0.729 [0.655, 0.798] |
| Rule baseline v0 | 0.539 [0.458, 0.618] | 0.721 [0.648, 0.789] |
| Qwen3.8-27B, zero-shot, prompt fijo | 0.802 [0.732, 0.868] | 0.922 [0.880, 0.961] |
| Qwen3-0.6B + LoRA (brazo decoder) | 0.783 [0.716, 0.851] | 0.888 [0.840, 0.929] |

Los intervalos de confianza son bootstrap remuestreados por emisor. La diferencia pareada frente a la regla v1 es de +0.198 [0.132, 0.263] en *before* y +0.209 [0.149, 0.272] en *after*. Frente al modelo de 27B, las diferencias son −0.004 [−0.030, 0.021] y +0.016 [−0.020, 0.054]; ambos intervalos incluyen cero, por lo que los autores no reclaman superioridad ni inferioridad frente a ese modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 278M parametros, la inferencia en fp32 requiere aproximadamente 1,1 GB de pesos; en fp16 alrededor de 0,6 GB. No se han publicado cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre es suficiente; una RTX 4090 o A100 estan sobredimensionadas para este modelo y solo se justifican por volumen de peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU, como demuestran los ejemplos de la model card ejecutados en CPU.
- Opciones de despliegue: el modelo se distribuye con un script propio (`fintermie_eventprice.py`) que gestiona la tokenizacion por ventanas, la extraccion de candidatos, los umbrales y la desambiguacion de spans; se carga con `transformers` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El procesamiento es por ventanas de 512 tokens con stride de 128, por lo que la latencia escala con la longitud de la narrativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Exactitud *before* / *after* (E-Issuer) | Licencia |
|---|---|---|---|---|---|
| FinTermIE-EventPrice-KO | 278M | 512 tokens/ventana | Encoder + cabeza de spans | 0.798 / 0.938 | MIT |
| Qwen3.8-27B (zero-shot) | 27B (no confirmado) | no disponible | LLM decoder generativo | 0.802 / 0.922 | no disponible |
| Qwen3-0.6B + LoRA | 0.6B (no confirmado) | no disponible | LLM decoder afinado | 0.783 / 0.888 | no disponible |
| Rule baseline v1 | no aplica | no aplica | Reglas lexicas | 0.601 / 0.729 | no aplica |

La comparativa se limita a los sistemas evaluados por los propios autores en el conjunto E-Issuer; no se dispone de datos de otros modelos de extraccion financiera coreana para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Version experimental: los propios autores declaran que no hay garantia de precision para uso en produccion.
- Fallo en puerta de seguridad: cuando el precio previo al ajuste no esta escrito en el texto, el modelo respondio en 3 de 46 documentos frente a 1 de 46 de la linea base de reglas, es decir, tiende a no abstenerse en ese escenario.
- Tasa de acierto limitada en *before*: 0.798 frente a un techo de 0.82, lo que deja margen de error incluso en documentos respondibles.
- Ejemplo documentado de fallo: en la narrativa sintetica `both_present`, que contiene explicitamente "조정 전 6,050원에서 조정 후 4,686원", el modelo devolvio el valor *before* pero se abstuvo en *after* (margen −3.73), mostrando que el fallo mas probable es una respuesta ausente, no una cifra inventada.
- Entrada restringida: solo debe alimentarse con el texto narrativo; introducir la tabla de la divulgacion rompe la correspondencia con las etiquetas de entrenamiento.
- Dominio y idioma acotados: unicamente coreano y exclusivamente narrativas de ajuste de precio de conversion en tres tipos de instrumento; no se ha evaluado fuera de ese dominio.
- Dependencia de umbrales fijos: los umbrales (before −1.0, after −1.5) se eligieron sobre el conjunto de desarrollo; elevarlos aumenta la abstencion, pero no se documenta su comportamiento en distribuciones distintas.
- Riesgo de sesgo: no se documenta analisis de sesgos.
- Riesgo de alucinacion: estructuralmente bajo, ya que la salida esta anclada a numeros presentes en la entrada; el riesgo residual es la seleccion de un numero incorrecto del texto.
- Licencia MIT: permite uso comercial, pero la condicion experimental y la ausencia de garantias hacen recomendable validacion humana en cualquier despliegue productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/FinTermIE-EventPrice-KO
- Model card en coreano: https://huggingface.co/ThakiCloud/FinTermIE-EventPrice-KO/blob/main/MODEL_CARD.ko.md
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
