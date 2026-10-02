# wlstjs/koelectra

## Resumen

wlstjs/koelectra es un modelo de clasificación de texto en coreano publicado en HuggingFace por el usuario wlstjs. Se trata de un ajuste fino (fine-tuning) del modelo daekeun-ml/koelectra-small-v3-nsmc, que a su vez deriva de la familia KoELECTRA v3, una implementación de la arquitectura ELECTRA preentrenada para coreano. Con 14.122.498 parámetros (unos 14,1 millones), es un modelo encoder-only muy ligero, orientado exclusivamente a clasificación de secuencias y no a generación de texto.

El modelo se enmarca en la tarea de análisis de sentimiento sobre texto coreano, heredada del nombre de su modelo base (la terminación "nsmc" hace referencia al Naver Sentiment Movie Corpus, un corpus de reseñas de películas). El autor declara una precisión de 0,866 y una pérdida de 0,4838 en el conjunto de evaluación, con cinco épocas de entrenamiento. No obstante, la model card está generada automáticamente por el Trainer de HuggingFace y no documenta el conjunto de datos, las etiquetas de salida ni los usos previstos.

Su relevancia es limitada pero concreta: sirve como ejemplo de pipeline de ajuste fino reproducible sobre KoELECTRA small, y como clasificador de sentimiento coreano de bajísimo coste computacional que puede ejecutarse en CPU. Con solo 13 descargas y 0 "likes" en el momento de la consulta, carece de validación por parte de la comunidad y debe tratarse como un experimento más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ELECTRA (variante small de KoELECTRA v3) con cabeza de clasificacion de secuencias |
| Parametros totales | 14.122.498 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia KoELECTRA v3 suele trabajar con 512 tokens, pero la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados; tecnicamente viable INT8 dinamico de PyTorch u ONNX Runtime) |
| Idiomas soportados | no disponible en los metadatos; el modelo base esta preentrenado en coreano, por lo que el uso esperable es coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (segun los tags del repositorio) |
| Tarea (pipeline) | text-classification |
| Modelo base | daekeun-ml/koelectra-small-v3-nsmc |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 13 / 0 |
| Fecha de publicacion (metadatos de HuggingFace) | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ELECTRA en su variante "small" de la tercera generación de KoELECTRA. ELECTRA es un esquema de preentrenamiento con dos redes: un generador pequeño que enmascara tokens y un discriminador que debe detectar si cada token ha sido sustituido (replaced token detection). En la práctica, para el ajuste fino se conserva el encoder del discriminador y se le añade una cabeza de clasificación sobre el token [CLS]. Se trata, por tanto, de un transformer bidireccional encoder-only, no de un modelo generativo ni de un modelo de mezcla de expertos.

Los datos de entrenamiento no están documentados: la model card indica literalmente que el ajuste se hizo "on the None dataset" y que se necesita más información. El nombre del modelo base remite al corpus NSMC (Naver Sentiment Movie Corpus), un conjunto de reseñas de cine en coreano con polaridad positiva/negativa, pero no hay confirmación en la ficha del autor. Los hiperparámetros sí están registrados: learning rate 2e-05, tamaño de lote de entrenamiento y evaluación de 16, 5 épocas, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa, algo coherente con una tarea de clasificación.

La curva de validación muestra la pérdida mínima en la época 3 (0,4584) con precisión 0,878, mientras que la época final 5 registra pérdida 0,4838 y precisión 0,866. Esto sugiere un ligero sobreajuste a partir de la tercera época y que el checkpoint publicado no es el mejor punto de la curva de validación. Las versiones de framework empleadas son Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de texto en coreano: el pipeline declarado es text-classification, con una cabeza de clasificación sobre el encoder ELECTRA.
- Análisis de sentimiento (presunto): por herencia del modelo base (NSMC), lo esperable es una salida binaria de polaridad, aunque las etiquetas concretas no están documentadas.
- Inferencia muy ligera: 14,1 millones de parámetros permiten ejecución en CPU sin GPU.
- Compatible con el ecosistema Transformers y con el tag endpoints_compatible de HuggingFace.
- No soporta generación de texto: es un encoder-only sin decoder.
- No hay evidencia de soporte de tool calling, function calling ni agentes.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe: no disponible; el preentrenamiento del modelo base es monolingüe en coreano.
- Razonamiento multi-paso y matemáticas: no aplica a esta arquitectura.

## Casos de uso

- Análisis de reseñas de cine y series en coreano: es el dominio más probable dado el origen NSMC del modelo base. Se usaría como clasificador de polaridad por reseña, con lotes grandes y coste mínimo de cómputo.
- Monitorización de marca en redes sociales coreanas: filtrar menciones positivas y negativas de un producto en tiempo real, ejecutando el modelo en CPU dentro del propio ingestor de datos sin necesidad de GPU.
- Voz del cliente en comercio electrónico coreano: etiquetar automáticamente reseñas de producto y detectar aquellas con sentimiento negativo para priorizar su revisión por atención al cliente.
- Enrutado y triaje de tickets de soporte: usar la polaridad estimada como señal auxiliar para clasificar por urgencia percibida los tickets escritos en coreano, combinándolo con reglas de negocio.
- Investigación en PLN coreano: servir como línea base (baseline) reproducible para comparar técnicas de ajuste fino sobre KoELECTRA small, dado que se publican los hiperparámetros completos y la curva de validación.
- Anotación asistida y preetiquetado de corpus: preclasificar grandes volúmenes de texto coreano antes de una revisión humana, reduciendo el coste de anotación en proyectos de etiquetado supervisado.
- Filtrado de datos para entrenamiento de modelos mayores: descartar o separar documentos por polaridad en un pipeline de curación de corpus en coreano.
- Experimentos docentes o de prototipado: por su tamaño (0,1 GB) y su licencia MIT, es adecuado para demostraciones de pipelines de clasificación en entornos con recursos muy limitados.

Advertencia transversal: dado que las etiquetas de salida no están documentadas, en cualquiera de estos casos es imprescindible inspeccionar el mapeo de `id2label` antes de desplegar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, KLUE, HumanEval u otros) en la informacion disponible: el campo `model-index` de la model card esta vacio. Los unicos datos numericos son los de evaluacion durante el entrenamiento, declarados por el autor:

| Epoca | Paso | Perdida de validacion | Precision |
|---|---|---|---|
| 1.0 | 94 | 0,7131 | 0,856 |
| 2.0 | 188 | 0,5067 | 0,864 |
| 3.0 | 282 | 0,4584 | 0,878 |
| 4.0 | 376 | 0,4926 | 0,862 |
| 5.0 | 470 | 0,4838 | 0,866 |

Resultado final declarado en la model card sobre el conjunto de evaluacion: perdida 0,4838 y precision 0,866. La perdida de entrenamiento no fue registrada ("No log"). Estos valores proceden del propio autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Los pesos ocupan aproximadamente 56,5 MB en FP32, 28,2 MB en FP16 y 14,1 MB en INT8; el resto del consumo corresponde al runtime (PyTorch, CUDA o inferencia en CPU).
- GPU recomendadas: no requiere GPU. Cualquier GPU sirve, incluidas GTX 1650, RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100; usar modelos de gama alta solo aporta ventaja en throughput por lotes muy grandes.
- Compatibilidad con GPU de consumo: sí, en todas las GPU consumer actuales, e incluso en CPU sin acelerador dedicado.
- Opciones de despliegue: pipeline de Transformers, TorchScript, exportación a ONNX con ONNX Runtime, servicio propio con FastAPI o Flask, y HuggingFace Inference Endpoints (el repositorio lleva el tag endpoints_compatible). vLLM, TGI, llama.cpp y Ollama no son opciones adecuadas: están orientados a modelos generativos decoder-only y no soportan este tipo de encoder de clasificación.
- Latencia y throughput estimados: no hay mediciones publicadas. Como estimación orientativa derivada del tamaño (14,1 millones de parámetros), en CPU moderna y con textos cortos de unas 30 palabras cabría esperar del orden de centenares a miles de secuencias por segundo con lotes y ONNX Runtime, y un orden de magnitud superior en GPU con lotes grandes. Son cifras no verificadas, no resultados medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wlstjs/koelectra (este modelo) | 14.122.498 | no disponible | Clasificacion (sentimiento, presunto) | MIT | HuggingFace, 13 descargas, 0 likes |
| daekeun-ml/koelectra-small-v3-nsmc (modelo base) | no disponible | no disponible | Clasificacion de sentimiento sobre NSMC | no disponible | HuggingFace |
| monologg/koelectra-small-v3-discriminator | no disponible | no disponible | Encoder preentrenado en coreano para ajuste fino | no disponible (el proyecto KoELECTRA se cita como Apache-2.0 en fuentes de terceros, no verificado aqui) | HuggingFace y GitHub |
| monologg/koelectra-base-v3-discriminator | no disponible | no disponible | Encoder preentrenado en coreano para ajuste fino (variante base, mayor capacidad) | no disponible (misma observacion que la fila anterior) | HuggingFace y GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion consultada, por lo que la comparacion se limita a tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: el autor indica "More information needed" en descripcion, usos previstos y datos de entrenamiento. El conjunto de datos aparece como "None".
- Etiquetas de salida sin documentar: se desconoce el mapeo exacto de `id2label` y si la clasificacion es binaria o multiclase. Es obligatorio verificarlo antes de cualquier uso.
- Sobreajuste probable: la mejor perdida de validacion se alcanza en la epoca 3 (0,4584 / 0,878 de precision) y empeora en las epocas 4 y 5; el checkpoint final no es el optimo de la curva de validacion.
- Sesgo de dominio: si el ajuste proviene efectivamente del corpus NSMC, el modelo esta especializado en resenas de cine en coreano, con lenguaje informal, y su comportamiento fuera de ese dominio (noticias, texto tecnico, lenguaje formal) es impredecible.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es una calibracion deficiente de las probabilidades de clase.
- Limitacion idiomatica: no hay evidencia de soporte de otros idiomas distintos del coreano; usarlo con texto en castellano carece de sentido.
- Cobertura de contexto: la longitud maxima de secuencia no esta documentada, lo que obliga a validarla experimentalmente antes de procesar documentos largos.
- Validacion nula por la comunidad: 13 descargas y 0 "likes" en el momento de la consulta; no existen evaluaciones independientes.
- Restricciones de licencia: este modelo se publica bajo MIT, lo que permite uso comercial, pero la licencia del modelo base y del preentrenamiento original (KoELECTRA) deberia verificarse de forma independiente antes de un despliegue comercial.
- Sin garantias de mantenimiento: el repositorio fue creado y actualizado el mismo dia y no muestra actividad posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wlstjs/koelectra
- Modelo base: https://huggingface.co/daekeun-ml/koelectra-small-v3-nsmc
- Repositorio GitHub de KoELECTRA (monologg): https://github.com/monologg/KoELECTRA
- Ficha de KoELECTRA en olud.ai: https://olud.ai/project/monologg-koelectra.html
- Ficha de KoELECTRA en aibase: https://model.aibase.com/models/details/1924737670773477376
- Entrada de blog sobre KoELECTRA: https://jerrycodezzz.tistory.com/135
- Modelo relacionado de terceros (KSJcompany/LLM-assignment1-KoELECTRA): https://huggingface.co/KSJcompany/LLM-assignment1-KoELECTRA
