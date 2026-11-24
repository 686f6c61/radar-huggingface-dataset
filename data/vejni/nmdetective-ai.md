# Vejni/NMDetective-AI

## Resumen

NMDetective-AI es un modelo de predicción de efectos de variantes genómicas especializado en el mecanismo de degradación del ARNm mediada por mutaciones sin sentido (nonsense-mediated decay, NMD). Lo desarrolla Vejni (autor del repositorio, con un paper asociado de Veiner et al. en bioRxiv 2026) y resuelve un problema concreto: predecir cuantitativamente con qué eficiencia un codón de terminación prematuro (PTC) desencadena la degradación del ARNm. A diferencia de modelos basados en reglas, lee el ARNm mutante completo, de modo que captura tanto el contexto de secuencia como la posición del PTC en la estructura de exones.

El modelo es un fine-tuning end-to-end del encoder genómico Orthrus (variante large-6-track, arquitectura Mamba) al que se le añade una cabeza MLP que produce un único escalar por variante. Con solo 10,3 M de parámetros totales, es un modelo pequeño y especializado, no un modelo de lenguaje general. Su relevancia radica en que combina un encoder de secuencia genómica con datos de expresión alélica específica a gran escala (~14.000 PTCs somáticos en TCGA), lo que permite una predicción cuantitativa en lugar de una clasificación binaria.

La salida está normalizada de forma que los PTCs canónicos que activan NMD promedian +0,5 y los PTCs del último exón (que evaden NMD) promedian −0,5. Está pensado para uso en investigación, no validado para decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Orthrus (6-track, Mamba) fine-tuned end to end + cabeza MLP [256, 64] con LayerNorm y GELU |
| Parametros totales | 10,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: ARNm mutante completo, 5′ UTR + CDS + 3′ UTR) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`NMDetectiveAI.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura parte del encoder Orthrus en su variante large-6-track, basado en Mamba (modelo de espacio de estados), que se fine-tunea de extremo a extremo. La entrada es el ARNm mutante completo representado en seis pistas (tracks): A, C, G, T, inicio de codón y fin de exón. La salida del encoder se agrega mediante mean-pooling a un embedding de 512 dimensiones, que pasa por una MLP de dos capas [256, 64] con LayerNorm y GELU hasta producir un único escalar: la eficiencia de NMD normalizada para esa variante.

El entrenamiento se realizó sobre estimaciones de expresión alélica específica de eficiencia de NMD para aproximadamente 14.000 PTCs somáticos (SNVs sin sentido e indels con cambio de marco) procedentes de TCGA, manteniendo los cromosomas 1 y 17 fuera del entrenamiento para validación. El modelo se evaluó sobre ~1.800 PTCs germinales y sobre datos de mutagénesis saturada profunda (deep mutational scanning). Las coordenadas de referencia son GRCh38 y la anotación de transcritos es GENCODE v26, resuelta con GenomeKit. Por defecto se emplea el transcrito MANE Select (o el transcrito codificante más largo cuando MANE no está disponible).

## Capacidades

- Predicción cuantitativa de eficiencia de NMD para PTCs en transcritos codificantes de proteína: SNVs/MNVs sin sentido e indels con cambio de marco o en marco que generan un codón de parada prematuro.
- Integración del contexto de secuencia completo del ARNm mutante, no solo la posición del PTC.
- Manejo de entradas en formato genómico (por ejemplo `chr17:7674945:G:A`) y en formato HGVS (por ejemplo `TP53:c.586C>T`).
- Predicción por lotes que devuelve un DataFrame (`predict_many`).
- Carga del modelo como red neuronal pura (`load_ai_model`) para inferencia directa sobre tensores de forma `(batch, length, 6)`.
- Modelo complementario basado en reglas (NMDetective-B+) que puede combinarse con el modelo de IA en el flujo de predicción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo biológico especializado, no un LLM.

## Casos de uso

- Priorización de variantes en estudios de genómica del cáncer: dado un conjunto de variantes sin sentido detectadas en secuenciación tumoral, el modelo puntúa la eficiencia de NMD esperada para cada una, permitiendo priorizar aquellas con mayor probabilidad de escapar a la degradación y contribuir a la pérdida de función.
- Interpretación de variantes germinales en investigación genética: para ~1.800 PTCs germinales de validación, el modelo permite estimar el impacto funcional de variantes de truncamiento en genes humanos y filtrar candidatos en estudios de asociación.
- Análisis de datos de mutagénesis saturada profunda (DMS): el modelo puede usarse para predecir la eficiencia de NMD de librerías de variantes y contrastarla con lecturas experimentales, ayudando a diseñar o validar experimentos.
- Integración en pipelines bioinformáticos de anotación de variantes: mediante la API `VariantPredictor` y la CLI (`python main.py predict variant ...`), el modelo se puede incorporar a flujos existentes que resuelvan transcritos con GENCODE v26 y coordenadas GRCh38.
- Investigación en mecanismos de NMD: al permitir comparar la predicción del modelo de IA con el modelo de reglas NMDetective-B+, los investigadores pueden identificar variantes donde las reglas clásicas fallan y el contexto de secuencia es determinante.
- Docencia y formación en genómica computacional: el modelo, con solo 10,3 M de parámetros y una cabecera MLP sencilla, sirve como ejemplo didáctico de fine-tuning de un encoder genómico para una tarea de regresión biológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluación sobre ~1.800 PTCs germinales y datos de mutagénesis saturada profunda, y remite al paper (bioRxiv 2026) para los resultados, pero no incluye cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado el tamaño de 10,3 M de parámetros; el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA es suficiente. El README menciona requisitos de CUDA y `mamba-ssm` para la instalación del paquete.
- Cabe en GPU de consumo: sí, con amplio margen (el peso del modelo en safetensors es del orden de decenas de MB).
- Opciones de despliegue: el paquete Python del repositorio de GitHub (`NMD.modeling.predict_variant`) y la CLI (`main.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NMDetective-AI | Encoder Mamba + MLP para eficiencia de NMD | 10,3 M | ARNm completo (longitud no especificada) | MIT | Hugging Face + GitHub |
| NMDetective-B+ | Modelo basado en reglas (compañero) | no disponible | no disponible | no disponible | Hugging Face |
| Orthrus (base) | Encoder genómico Mamba 6-track | no disponible (variante large) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo puntúa PTCs en transcritos codificantes: SNVs/MNVs sin sentido e indels con cambio de marco o en marco que crean un codón de parada prematuro. Las variantes de sitio de splicing, pérdida de inicio y pérdida de parada quedan fuera del alcance.
- La predicción depende del transcrito: por defecto se usa MANE Select o el transcrito codificante más largo, lo que puede producir resultados distintos según la anotación elegida.
- Coordenadas limitadas a GRCh38 y anotación GENCODE v26 (vía GenomeKit).
- Uso exclusivo en investigación: no validado para toma de decisiones clínicas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el modelo produce un escalar de regresión y no genera explicaciones ni texto.
- Sesgos: no documentados en la información disponible; el entrenamiento se basa en PTCs somáticos de TCGA, lo que puede limitar la generalización a otras poblaciones o tipos de variantes.
- Licencia MIT, que permite uso comercial, pero con la advertencia explícita de que el modelo no está validado para uso clínico.
- No se documentan requisitos de cuantización ni formatos alternativos de pesos; solo se distribuye el state dict en safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vejni/NMDetective-AI
- Código: https://github.com/Vejni/NMDetectiveAI
- Modelo complementario basado en reglas (NMDetective-B+): https://huggingface.co/Vejni/NMDetective-BPlus
- Paper (bioRxiv 2026): https://www.biorxiv.org/content/10.64898/2026.03.24.714003v1
- Encoder base Orthrus: https://huggingface.co/quietflamingo/orthrus-large-6-track
