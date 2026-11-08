# xuan-liu/ARIES

## Resumen

ARIES es un modelo de predicción de sitios de reacción enzimática condicionada por enzima. Dado un sustrato (representado como grafo molecular) y una enzima (representada por su secuencia), ARIES predice en qué átomos del sustrato se producirá la reacción química. El modelo combina tres fuentes de representación: características atómicas y de enlace dirigido de GROVER (grafo molecular), representaciones de residuos de ESM-C-6B (modelo de proteínas de 6.000 millones de parámetros) y una representación de plantilla de reacción. Lo desarrolla xuan-liu y se publica bajo licencia MIT.

El repositorio de pesos (7,5 GB) contiene múltiples variantes: modelos base de distinta escala (XS, S, M, L, XL), adaptadores LoRA especializados por familia enzimática (P450, GT, MT, FAD, PT, halogenasas), un modelo XL entrenado desde cero (`aries-xl-brenda-v1`) y un modelo de referencia basado en grafos (GNN-SOM). La arquitectura central es un transformer con atención multi-cabecera sobre representaciones conjuntas de sustrato, enzima y plantilla, con anchuras de 384 (L) y 512 (XL), 12 y 16 cabezas respectivamente, y tres o cuatro bloques de contexto y de codificador de plantilla.

Es relevante porque aborda una tarea de química computacional —la anotación de sitios de reacción enzimática— con un enfoque multimodal que fusiona grafos moleculares y embeddings proteicos de gran escala, y porque publica pesos, datos y código de inferencia de forma abierta. No es un modelo de lenguaje general: su uso está restringido a la predicción de sitios de reacción y a la investigación en enzimología y biología computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención multi-cabecera sobre representaciones conjuntas de grafo molecular (GROVER), residuos proteicos (ESM-C-6B) y plantilla de reacción; incluye también un modelo de referencia GNN-SOM basado en grafos KCF/EC |
| Parametros totales | 60.637.697 (variante XL, `aries-ft-v1-v1`); otras escalas (XS, S, M, L) no especificadas |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no aplica (modelo de química, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), con ficheros `seed42.pt`, `seed43.pt`, `seed44.pt` y `model_info.json` por directorio; adaptadores LoRA en formato de tensores de adaptador |

## Arquitectura y entrenamiento

ARIES procesa tres modalidades: el sustrato como grafo molecular con características atómicas y de enlace dirigido de GROVER (ancho fijo de cuatro), la enzima como secuencia de residuos codificada por ESM-C-6B (6.000 millones de parámetros, usado como extractor de características), y una representación de plantilla de reacción. La variante L usa anchura 384, 12 cabezas de atención, tres bloques de contexto y tres capas de codificador de plantilla. La variante XL (`aries-xl-brenda-v1`) usa anchura 512, 16 cabezas y cuatro capas de contexto y de plantilla, con 60.637.697 parámetros en la versión de ajuste completo (`aries-ft-v1-v1`).

El entrenamiento se realiza sobre BRENDA. La colección canónica contiene 22.326 ejemplos (release `aries-db-2026-10-31-grover-fixed4-v2`), mientras que el pool de exclusión experimental tiene 22.258 filas. Existe también un pool de halogenasas de 489 filas con exclusión experimental. Los conjuntos de exclusión experimental eliminan siete secuencias enzimáticas y cuatro conectividades de sustrato exactas, preservando identificadores, etiquetas y asignaciones de split. La selección de checkpoints se hace por métricas de validación y las etiquetas experimentales se usan solo después de la predicción. Cada split contiene las semillas 42, 43 y 44. Los adaptadores LoRA usan rango 16 y alpha 32. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de los recuentos anteriores.

## Capacidades

- Predicción de sitios de reacción enzimática condicionada por enzima: identifica los átomos del sustrato donde se produce la reacción.
- Representación multimodal: integra grafos moleculares (GROVER) con embeddings proteicos de gran escala (ESM-C-6B) y plantilla de reacción.
- Generalización a escenarios de enzima desconocida, sustrato desconocido y transformación desconocida, mediante modelos específicos por split (`aries-l-unknown-enzyme`, `aries-l-unknown-substrate`, `aries-l-unknown-transformation`, y combinaciones).
- Adaptación por familia enzimática mediante LoRA: P450, GT, MT, FAD, PT y halogenasas.
- Ajuste completo disponible (`aries-ft-v1-v1`) sin necesidad de adaptador en inferencia.
- Modelo de referencia GNN-SOM (KCF/EC) para comparación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo especializado de química computacional.

## Casos de uso

- Anotación de sitios de reacción en enzimas: dado un par enzima-sustrato, predecir los átomos reactivos para priorizar experimentos de validación en laboratorio, usando los modelos L o XL según el régimen de generalización requerido.
- Enzimas desconocidas: usar `aries-l-unknown-enzyme` para predecir sitios de reacción en enzimas sin ejemplos previos en el conjunto de entrenamiento, escenario habitual en el descubrimiento de nuevas enzimas.
- Sustratos desconocidos: emplear `aries-l-unknown-substrate` para evaluar sustratos novedosos frente a enzimas conocidas, útil en el cribado de sustratos para biotransformaciones.
- Transformaciones desconocidas: usar `aries-l-unknown-transformation` para predecir reacciones de tipos no vistos durante el entrenamiento, relevante en la exploración de reactividad enzimática.
- Especialización por familia enzimática: aplicar los adaptadores LoRA de P450, GT, MT, FAD o PT sobre `aries-random-xl` para mejorar la precisión en familias concretas de interés industrial o farmacéutico.
- Halogenasas: usar los adaptadores y modelos de ajuste completo del pool de halogenasas (489 filas) para predecir sitios de reacción en esta familia de enzimas de interés en química sintética.
- Comparación con modelos de grafos: ejecutar GNN-SOM como referencia para contrastar el rendimiento del transformer multimodal en la misma tarea.
- Investigación en enzimología computacional: reproducir los benchmarks de seis splits de BRENDA con las semillas 42/43/44 para validar metodologías de predicción de sitios de reacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la existencia de un benchmark de seis splits sobre BRENDA (random, unknown enzyme, unknown substrate, unknown transformation, unknown transformation + substrate, unknown transformation + substrate + enzyme) con semillas 42/43/44, pero no incluye las métricas numéricas obtenidas. No se inventan cifras.

## Requisitos de hardware

- El repositorio completo ocupa 7,5 GB, pero la inferencia requiere descargar solo el directorio del modelo elegido junto con el paquete de inferencia `aries/`.
- El modelo XL tiene 60.637.697 parámetros; en precisión completa (fp32) ocupa aproximadamente 240 MB, y en fp16 unos 120 MB, sin contar el extractor ESM-C-6B (6.000 millones de parámetros) que domina el consumo de memoria.
- ESM-C-6B, usado como extractor de características, requiere memoria de GPU sustancial; se recomienda una GPU con al menos 24-48 GB de VRAM para ejecutar el pipeline completo en fp16, aunque el dato exacto no está disponible.
- GPU recomendadas: A100, H100 o RTX 4090 para el pipeline completo; el transformer ARIES por sí solo cabe en GPU de consumo.
- Opciones de despliegue: el paquete de inferencia `aries-inference` del repositorio de GitHub, con instalación vía conda (Python 3.12) y descarga con `hf download`. No se documentan soporte para vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARIES (XL) | 60.637.697 | no disponible | Predicción de sitios de reacción enzimática | MIT | Pesos en Hugging Face, código en GitHub |
| GNN-SOM | no disponible | no disponible | Predicción de sitios de reacción (grafos KCF/EC) | MIT (referencia retenida de HassounLab) | Incluido en el mismo repositorio |
| Otros modelos de predicción de sitios de reacción | no disponible | no disponible | Predicción de sitios de reacción | no disponible | no disponible |

La información disponible solo permite comparar ARIES con GNN-SOM, su referencia interna de grafos. No se dispone de datos de rendimiento comparativo entre ambos ni de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje ni un asistente; no genera texto, no razona en lenguaje natural ni soporta tool calling o agentes.
- Dependencia de ESM-C-6B: el pipeline requiere el extractor de proteínas de 6.000 millones de parámetros, lo que eleva los requisitos de memoria y cómputo.
- Cobertura limitada a BRENDA y al pool de halogenasas: el rendimiento fuera de las familias enzimáticas y transformaciones representadas en estos datos no está garantizado.
- Riesgo de generalización limitado en enzimas, sustratos o transformaciones desconocidas; por ello se publican modelos específicos por split, que deben elegirse correctamente.
- Los adaptadores LoRA deben emparejarse con la base exacta (`aries-xl-brenda-v1` o `aries-random-xl`) y la semilla correspondiente; un emparejamiento incorrecto invalida los resultados.
- Los conjuntos con exclusión experimental eliminan secuencias y conectividades específicas; las predicciones sobre esos casos no reflejan el rendimiento en condiciones de despliegue general.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones de las dependencias (ESM-C-6B, GROVER, GNN-SOM) que pueden tener licencias propias.
- No se documentan sesgos conocidos ni tasas de alucinación, dado que no es un modelo generativo de lenguaje.
- Fecha de creación del repositorio (2026-11-08) y release de datos (`aries-db-2026-10-31`) indican un proyecto reciente, con 0 descargas y 0 likes en el momento de la consulta; la validación por la comunidad es aún escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xuan-liu/ARIES
- Dataset ARIES-data: https://huggingface.co/datasets/xuan-liu/ARIES-data
- Repositorio del proyecto en GitHub: https://github.com/xuanliugit/ARIES
- Implementación de referencia GNN-SOM: https://github.com/HassounLab/GNN-SOM
- Manifiesto de modelos: `model_manifest.csv` (incluido en el repositorio de Hugging Face)
