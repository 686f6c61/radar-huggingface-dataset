# stefan-it/zeitunks-lm-v1-ner-hisgermaner

## Resumen

Zeitunks-LM fine-tuned on HisGermaNER es un modelo de reconocimiento de entidades nombradas (NER) para alemán histórico, desarrollado por Stefan Schweter (stefan-it). Se construye sobre el encoder BiXL-Kron (stefan-it/zeitunks-lm-v1), un modelo bidireccional de tipo KronLSTM preentrenado sobre periódicos alemanes históricos, y se afina específicamente sobre el corpus HisGermaNER de la Biblioteca Nacional de Austria, que cubre el periodo 1710-1840.

El modelo resuelve un problema concreto y poco atendido: la extracción de entidades (personas, organizaciones y lugares) en textos alemanes de los siglos XVIII y XIX, donde la ortografía variable, la tipografía de imprenta y la sintaxis arcaica degradan el rendimiento de los modelos NER modernos entrenados con texto contemporáneo. La arquitectura es deliberadamente atípica: sin atención y sin embeddings posicionales, apuesta por recurrencia lineal (KronLSTM) para procesar secuencias largas con coste computacional reducido.

Con 96,9 millones de parámetros y una licencia Apache 2.0, es un modelo ligero y desplegable en hardware modesto, orientado a proyectos de humanidades digitales, digitalización de archivos y pipelines de procesamiento de corpus históricos. Su relevancia actual radica en la combinación de una arquitectura eficiente (attention-free) con un dominio especializado y una evaluación reproducible con múltiples semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: encoder bidireccional KronLSTM (recurrencia lineal, sin atención ni embeddings posicionales) |
| Parametros totales | 96.940.103 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 piezas por fragmento (las secuencias más largas se dividen y se reensamblan) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en precisión completa; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | alemán (de), con foco en alemán histórico 1710-1840 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El encoder base es BiXL-Kron, una pila bidireccional de KronLSTM: una variante de LSTM con matrices de recurrencia factorizadas mediante productos de Kronecker, lo que reduce drásticamente el número de parámetros y el coste por paso frente a un transformer de tamaño comparable. No emplea mecanismo de atención ni codificación posicional explícita; la información de orden la aporta la propia recurrencia. El modelo base se preentrenó sobre periódicos alemanes históricos.

El afinamiento para NER se realizó sobre HisGermaNER (1.466 frases de entrenamiento, 48.692 tokens; 393 frases de desarrollo, 11.542 tokens; 386 frases de test, 9.594 tokens), con etiquetado IOB2 y tres tipos de entidad: LOC, ORG y PER (7 etiquetas incluyendo O). La cabeza de clasificación es LayerNorm → dropout 0.1 → capa lineal, aplicada únicamente sobre la primera pieza de cada palabra (pooling: first). Se usó AdamW (β = 0,9/0,999, ε = 1e-8, weight decay 0), learning rate 3e-5 con warmup lineal del 10 % de los pasos y decaimiento lineal posterior, batch de 16 frases, 10 épocas, clipping de gradiente 1,0, dropout de encoder 0,1, precisión bf16 y semilla 6. El learning rate se seleccionó mediante una rejilla de 8 valores, cada uno ejecutado con 10 semillas, eligiendo el de mejor F1 medio en desarrollo. El entrenamiento se ejecutó en modo determinista y reproduce predicciones idénticas byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en alemán histórico con tres tipos: LOC (lugares), ORG (organizaciones) y PER (personas), en formato IOB2.
- Procesamiento de texto con ortografía y tipografía de los siglos XVIII y XIX (corpus de 1710-1840).
- Segmentación a nivel de palabra: asigna una etiqueta por palabra a partir de su primera pieza, lo que encaja con tokenizadores de subpalabras.
- Manejo de secuencias largas mediante fragmentación en bloques de 512 piezas y reensamblado posterior.
- Inferencia con la pipeline `token-classification` de Transformers usando `aggregation_strategy="first"`.
- Ejecución en CPU (implementación de referencia de los kernels KronLSTM) y en GPU (kernels Triton vía el fork de `flash-linear-attention`).
- No soporta tool calling, function calling, agentes, visión ni audio: es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Digitalización de archivos históricos: extraer automáticamente nombres de personas, lugares y organizaciones de periódicos alemanes digitalizados entre 1710 y 1840, facilitando la creación de índices y metadatos buscables en proyectos de bibliotecas nacionales.
- Humanidades digitales e investigación histórica: construir redes prosopográficas y mapas de menciones geográficas a partir de corpus de prensa antigua, donde los modelos NER contemporáneos fallan por el cambio ortográfico.
- Enriquecimiento de corpus para motores de búsqueda académicos: anotar entidades en colecciones textuales para habilitar búsquedas facetadas por persona, lugar u organización.
- Preprocesamiento en pipelines de NLP histórica: servir como primer eslabón de anotación antes de tareas de resolución de entidades (entity linking) contra vocabularios históricos o autoridades como GND.
- Extracción de información en proyectos de genealogía: identificar nombres de personas y localidades en registros y gacetas históricas para su cruce con bases de datos genealógicas.
- Despliegue ligero en entornos con recursos limitados: con 96,9 M de parámetros y licencia Apache 2.0, puede ejecutarse en CPU o en GPU de consumo dentro de servicios de digitalización que procesan lotes nocturnos de documentos.
- Evaluación comparativa de arquitecturas: útil como referencia para investigadores que estudian el rendimiento de modelos attention-free (KronLSTM) frente a transformers en tareas de etiquetado de secuencias.

## Benchmarks y rendimiento

F1 micro a nivel de span (IOB2) sobre las particiones oficiales de HisGermaNER:

| Modelo / configuración | Dev F1 | Test F1 |
|---|---|---|
| Este checkpoint (semilla 6) | 83,46 | 86,78 (P 88,22 / R 85,38) |
| Media ± desviación sobre 10 semillas con lr 3e-5 | 81,58 ± 1,22 | 85,73 ± 1,17 |

Rejilla de learning rate (media ± desviación poblacional sobre 10 semillas):

| Learning rate | Dev F1 | Test F1 |
|---|---|---|
| 5e-6 | 78,64 ± 1,52 | 84,69 ± 0,57 |
| 1e-5 | 81,21 ± 1,25 | 86,25 ± 1,31 |
| 2e-5 | 81,40 ± 1,70 | 86,58 ± 1,08 |
| 3e-5 (seleccionado) | 81,58 ± 1,22 | 85,73 ± 1,17 |
| 5e-5 | 80,81 ± 0,86 | 84,01 ± 1,54 |
| 1e-4 | 78,69 ± 1,40 | 80,31 ± 1,23 |
| 2e-4 | 73,35 ± 1,78 | 72,35 ± 1,53 |
| 4e-4 | 51,82 ± 7,85 | 53,51 ± 5,59 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos NER sobre el mismo corpus.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32/bf16): en torno a 0,4-0,8 GB para los pesos (96,9 M de parámetros), más el overhead de activaciones, que es reducido al no haber atención cuadrática.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradas. También es viable en GPU integradas y en CPU.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: pipeline `token-classification` de Transformers con `trust_remote_code=True`; requiere instalar el fork fijado de `flash-linear-attention` (`git+https://github.com/NX-AI/KronLSTM.git@3d800c9a...`) para los kernels KronLSTM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada. Los kernels Triton en CUDA deberían ofrecer mejor rendimiento que la implementación de referencia en CPU, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos NER sobre HisGermaNER ni de comparaciones directas con alternativas. La model card menciona que este checkpoint usa "the same fine-tuning stack as for every encoder in the BiXL comparison", lo que sugiere una comparativa interna de encoders BiXL, pero los datos de esa comparación no se incluyen.

| Modelo | Parámetros | Contexto | Test F1 (HisGermaNER) | Licencia |
|---|---|---|---|---|
| stefan-it/zeitunks-lm-v1-ner-hisgermaner | 96,9 M | 512 piezas/fragmento | 86,78 | Apache 2.0 |
| Encoders alternativos de la comparativa BiXL | no disponible | no disponible | no disponible | no disponible |
| Modelos NER alemanes contemporáneos (p. ej. basados en BERT/GermanBERT) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con alemán histórico de 1710-1840; su rendimiento en alemán contemporáneo u otros idiomas no está evaluado y probablemente sea deficiente.
- Corpus de entrenamiento pequeño (1.466 frases, 48.692 tokens), lo que limita la cobertura de entidades poco frecuentes y aumenta la varianza entre semillas (desviación típica de ~1,2 puntos de F1 en test).
- Solo tres tipos de entidad (LOC, ORG, PER); no reconoce MISC, fechas, cantidades ni otras categorías habituales en NER.
- Riesgo de alucinación de entidades: como todo modelo de etiquetado, puede asignar etiquetas a tokens que no son entidades, especialmente en texto con OCR ruidoso o tipografía irregular.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y un fork fijado de `flash-linear-attention`; esto complica la reproducibilidad y la auditoría de seguridad en producción.
- La longitud efectiva se limita a fragmentos de 512 piezas; las frases más largas se dividen y reensamblan, lo que puede degradar la coherencia en entidades que cruzan el corte.
- El checkpoint publicado corresponde a una única semilla seleccionada por F1 en desarrollo; las métricas de test pueden no ser representativas del rendimiento medio.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de preentrenamiento del encoder base (periódicos históricos) debe verificarse en la model card del modelo base antes de un despliegue comercial.
- El autor declara que el script de empaquetado y la model card fueron generados con asistencia de modelos Claude; conviene revisar la documentación con criterio propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-hisgermaner
- Modelo base (BiXL-Kron): https://huggingface.co/stefan-it/zeitunks-lm-v1
- Dataset HisGermaNER: https://huggingface.co/datasets/stefan-it/HisGermaNER
- Fork de flash-linear-attention con kernels KronLSTM: https://github.com/NX-AI/KronLSTM
- Repositorio BiXL (script `finetuning/finetune_ner.py`): no disponible en la información proporcionada
