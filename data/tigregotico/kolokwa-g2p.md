# TigreGotico/kolokwa-g2p

## Resumen

Kolokwa G2P es un modelo de conversión grafema-a-fonema (G2P) especializado en inglés liberiano, también conocido como kolokwa (código ISO 639-3 `lir`). Convierte texto escrito en representación fonética IPA, lo que lo hace útil como componente previo en pipelines de síntesis de voz (TTS) para esa variedad lingüística. Lo desarrolla originalmente michsethowusu; el repositorio analizado es una copia publicada por TigreGotico en la revisión `92ed3b721a4f80f98d5b741fdd16352ca320f121`.

Arquitectónicamente es una red Forward Transformer no autorregresiva de 6 capas, un diseño habitual en G2P por su capacidad de procesar la secuencia completa en paralelo y producir alineamientos estables. El checkpoint incluye además un diccionario de pronunciación con 12.161 palabras extraídas de los datos de entrenamiento, lo que permite resolver por búsqueda directa las palabras vistas y recurrir a la red neuronal para las no vistas.

Su relevancia es acotada pero específica: el inglés liberiano es una variedad con escasa cobertura en herramientas fonetizadoras estándar, y este modelo cubre esa laguna con una licencia MIT y un formato ligero (0,1 GB) que se integra en el ecosistema `phonemize`/`scriptconv`. No es un modelo de lenguaje generativo ni un TTS completo: es un módulo fonetizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Forward Transformer no autorregresivo, 6 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | `en` (inglés), `lir` (inglés liberiano / kolokwa) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`), más `config.yaml` y `lexicon.tsv` |

## Arquitectura y entrenamiento

El modelo es un Forward Transformer no autorregresivo de 6 capas, una familia de arquitecturas diseñada para tareas de secuencia-a-secuencia sin dependencia del token anterior, lo que permite inferencia en paralelo y evita errores de exposición en decodificación autorregresiva. El checkpoint incorpora las clases de preprocesado (`LanguageTokenizer`, `Preprocessor`, `SequenceTokenizer`) necesarias para cargarlo con la librería `phonemize`.

El entrenamiento se realizó sobre el dataset `michsethowusu/kolokwa-text-ipa-jw`, y el repositorio incluye `lexicon.tsv` con 12.161 pares palabra-IPA que constituyen los datos de entrenamiento. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste adicional. Los scripts `prepare_data.py`, `train.py` y `train_kolokwa_jw_g2p.py` permiten reproducir la generación del léxico y el entrenamiento.

## Capacidades

- Conversión de texto a IPA para inglés liberiano (kolokwa), con clave de idioma `en_lr` en `phonemize` y `lir` en `scriptconv`.
- Manejo de rasgos fonéticos propios de la variedad: nasalización vocálica (p. ej. `mæ̃n`), aspiración de oclusivas (`tʰ`), vibrante aproximante (`ə˞`) y reducción de grupos consonánticos.
- Resolución por diccionario para las 12.161 palabras del léxico de entrenamiento, con respaldo de la red neuronal para palabras no vistas.
- Integración como fonetizador en pipelines TTS mediante `scriptconv` o `phonemize`.
- Herramienta de línea de comandos (`inference.py`) para fonemizar texto.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un módulo G2P puro.

## Casos de uso

- Síntesis de voz para inglés liberiano: el modelo actúa como etapa de fonemización previa a un TTS acústico, generando la secuencia IPA que alimenta al sintetizador y permitiendo construir voces para una variedad con escasa cobertura comercial.
- Normalización de pronunciación en corpus lingüísticos: convertir transcripciones ortográficas de kolokwa a IPA para análisis fonológico, comparación dialectal o anotación de corpus.
- Aplicaciones de accesibilidad y lectura en voz alta: integrar el fonetizador en lectores de pantalla o asistentes que necesiten pronunciar texto en inglés liberiano de forma inteligible.
- Investigación en fonética computacional: usar el léxico y el modelo como referencia reproducible para estudiar fenómenos como la nasalización o la aspiración en esta variedad.
- Localización de contenidos educativos: generar transcripciones fonéticas para materiales de enseñanza de inglés liberiano o de alfabetización.
- Componente en pipelines de datos multilingües: enriquecer datasets de ASR/TTS con etiquetas IPA para la variedad `lir`, aprovechando que el modelo es ligero (0,1 GB) y de licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura de 6 capas, la huella es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeño para ejecutarse en CPU con latencia aceptable en cargas por lotes.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM e incluso en CPU.
- Opciones de despliegue: librería `phonemize` (PyTorch 2.6+ con `weights_only=True` y `add_safe_globals`), paquete `scriptconv` con extra `[lir]`, y el script `inference.py` incluido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TigreGotico/kolokwa-g2p | G2P | en, lir | Forward Transformer 6 capas | MIT | Hugging Face |
| michsethowusu/kolokwa-g2p | G2P | en, lir | Forward Transformer 6 capas | MIT | Hugging Face (origen) |
| eSpeak NG / phonemizer clásico | G2P rule-based | múltiples | Basado en reglas | GPL | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un fonetizador, no un modelo generativo: no produce texto libre, razonamiento ni código.
- Cobertura léxica limitada a las 12.161 palabras del diccionario; las palabras fuera del léxico dependen de la generalización de la red, con riesgo de errores en nombres propios, préstamos y neologismos.
- Solo cubre inglés liberiano (y en menor medida inglés general); no es multilingüe.
- Riesgo de alucinación fonética: puede generar transcripciones IPA plausibles pero incorrectas para entradas ambiguas o fuera de distribución.
- Posibles sesgos derivados de la composición del corpus de entrenamiento (registro, variedad regional, dominio), no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del dataset original.
- En PyTorch 2.6+ es necesario registrar las clases de preprocesado como globals seguros antes de cargar el checkpoint, lo que añade un paso de configuración.
- No se han publicado métricas de precisión (PER/WER fonético) que permitan evaluar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/kolokwa-g2p
- Modelo original: https://huggingface.co/michsethowusu/kolokwa-g2p
- Dataset de entrenamiento: https://huggingface.co/datasets/michsethowusu/kolokwa-text-ipa-jw
- Librería `phonemize`: https://pypi.org/project/phonemize/
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
