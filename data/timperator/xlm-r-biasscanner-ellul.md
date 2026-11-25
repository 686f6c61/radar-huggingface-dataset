# Timperator/xlm-r-biasscanner-ellul

## Resumen

xlm-r-biasscanner-ellul es un clasificador multi-tarea de sesgo informativo desarrollado por Tim Menzner (proyecto BiasScanner), construido sobre el encoder multilingue XLM-RoBERTa-base. El modelo detecta sesgo a nivel de frase en noticias en aleman e ingles, clasifica el tipo concreto de sesgo entre 38 categorias de la taxonomia Menzner-Leidner de tecnicas de propaganda y estima la intensidad del sesgo en una escala ordinal de 0 a 1. Se entrena sobre ELLUL, un corpus bilingue de 3.668 frases anotadas manualmente (1.917 sesgadas y 1.751 no sesgadas).

La relevancia del modelo reside en su enfoque multi-cabeza: en lugar de una unica etiqueta binaria, expone cuatro salidas complementarias (deteccion binaria, tipos multi-etiqueta, intensidad ordinal y tipo dominante) que permiten agregar predicciones a nivel de frase para analizar articulos, publicaciones o corpus completos. Esto lo hace util para investigacion en medios, periodismo de datos y herramientas de alfabetizacion mediatica.

Arquitectonicamente es un encoder transformer de unos 278 millones de parametros con cuatro cabezas personalizadas. No es un checkpoint estandar de `transformers` para clasificacion de secuencias: requiere carga manual del `state_dict` en PyTorch. La licencia es Apache-2.0 y el modelo esta pensado explicitamente como herramienta de apoyo a la discusion, no como veredicto objetivo sobre sesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cuatro cabezas de prediccion paralelas |
| Parametros totales | Aproximadamente 278 M (XLM-RoBERTa-base) mas cabezas; no se detalla el recuento exacto en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa-base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (pesos en `model.pt` como `state_dict` PyTorch en fp32; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.pt` (state_dict PyTorch); no compatible con `AutoModelForSequenceClassification` |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-base como encoder compartido y anade cuatro cabezas: `binary` (clasificacion binaria con umbral 0.5), `types` (clasificacion multi-etiqueta sobre 38 tipos con umbral 0.35 por tipo), `strength` (regresion ordinal mediante 10 niveles acumulativos CORAL, salida de 0 a 1) y `primary` (clasificacion multiclase con 39 clases: 38 tipos de sesgo mas la clase no sesgada). Esta combinacion permite obtener simultaneamente una decision binaria, un perfil detallado de tecnicas presentes, una magnitud y una etiqueta dominante.

El entrenamiento se realizo sobre ELLUL, un dataset bilingue de 3.668 frases de noticias anotadas por humanos en aleman e ingles, con etiquetas derivadas de la taxonomia Menzner-Leidner de 38 tipos de sesgo y tecnicas de propaganda. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del corpus por fuente ni si se aplicaron tecnicas de RLHF o DPO (no procede en un encoder clasificador). Tampoco se especifican hiperparametros, regimen de congelacion del encoder ni estrategia de aumento de datos. El computo fue financiado por High-Tech Agenda Bayern mediante HPC4AI en el cluster FAU-HPC.

## Capacidades

- Deteccion binaria de sesgo a nivel de frase en aleman e ingles, con probabilidad calibrada por umbral por defecto de 0.5.
- Clasificacion multi-etiqueta de 38 tipos finos de sesgo y tecnicas de propaganda, con umbral independiente de 0.35 por tipo.
- Estimacion de intensidad de sesgo en escala ordinal de 0 a 1 mediante 10 niveles CORAL.
- Prediccion del tipo de sesgo dominante entre 38 categorias mas la clase no sesgada (39 clases).
- Capacidad multilingue limitada a aleman e ingles (entrenado sobre corpus bilingue, aunque el encoder base cubre 100 idiomas).
- Agregacion de predicciones a nivel de frase para analisis de articulos, publicaciones o corpus completos.
- Integracion como componente del complemento BiasScanner para navegador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un clasificador de texto puro.

## Casos de uso

- Analisis de sesgo en corpus periodisticos: procesar articulos completos frase a frase con el modelo y agregar las probabilidades binarias, los tipos detectados y la intensidad media para comparar lineas editoriales entre medios en aleman e ingles.
- Herramienta de alfabetizacion mediatica: integrar el modelo en una extension de navegador (como el complemento BiasScanner) que resalte frases potencialmente sesgadas y muestre el tipo de tecnica de propaganda detectada al lector.
- Investigacion academica en comunicacion: usar las cuatro cabezas para estudiar la distribucion de tecnicas de propaganda (por ejemplo, apelaciones emocionales frente a generalizaciones) en un corpus anotado, aprovechando la granularidad de 38 tipos.
- Monitorizacion editorial en redacciones: pasar borradores por el modelo antes de publicar para detectar frases con alta intensidad de sesgo o tecnicas como carga emotiva o falacias, y revisarlas manualmente.
- Periodismo de datos comparado: aplicar el modelo a pares de medios de distintas orientaciones sobre el mismo evento y cuantificar diferencias en intensidad y tipo de sesgo por frase.
- Filtrado y priorizacion en pipelines de moderacion de contenido informativo: usar la cabeza binaria como primer filtro (umbral 0.5) y la de tipos para enrutar frases sospechosas a revision humana con contexto sobre la tecnica detectada.
- Docencia y formacion de periodistas: generar ejemplos etiquetados automaticamente sobre un corpus de noticias reales para discutir en clase que constituye sesgo y por que el modelo puede discrepar del juicio humano.

## Benchmarks y rendimiento

La model card declara metricas de evaluacion (f1, precision, recall, roc_auc, matthews_correlation, mae, spearmanr) pero no incluye en la informacion proporcionada los valores numericos por tarea ni comparaciones con otros modelos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamano del repo); unos 550 MB en fp16 y unos 300 MB en cuantizacion int8, suficiente para cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que cabe incluso en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos diez anos (GTX 1050 en adelante), y tambien en CPU con latencias aceptables por frase.
- Opciones de despliegue: PyTorch nativo con carga manual del `state_dict` (unica via documentada); al no ser un checkpoint estandar de `transformers`, no es directamente compatible con vLLM, TGI ni Ollama sin conversion previa. llama.cpp requeriria conversion a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo (encoder base de 278 M) se espera procesamiento de cientos de frases por segundo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia |
|---|---|---|---|---|---|
| xlm-r-biasscanner-ellul | ~278 M | 512 tokens | Clasificacion multi-tarea de sesgo (38 tipos, intensidad) | de, en | Apache-2.0 |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Encoder base, sin cabeza de clasificacion | 100 idiomas | MIT |
| Modelos de deteccion de fake news genericos | No disponible | No disponible | Clasificacion binaria de veracidad | Variable | Variable |

No se dispone en la informacion proporcionada de resultados de benchmarks que permitan comparar el rendimiento de este modelo con alternativas especificas de deteccion de sesgo. La comparativa con xlm-roberta-base es estructural (mismo encoder), no de rendimiento en la tarea.

## Limitaciones y advertencias

- El sesgo informativo es en parte un fenomeno subjetivo; las predicciones no deben tratarse como juicios objetivos o definitivos, tal como advierte el propio autor.
- El modelo se entreno sobre 3.668 frases de noticias; puede generalizar mal a otros dominios (redes sociales, textos legales, opiniones) o a registros distintos del periodistico.
- No esta disenado para deteccion general de fake news ni para fact-checking; usarlo para esos fines excede su proposito declarado.
- La cobertura linguistica se limita a aleman e ingles, pese a que el encoder base es multilingue; el rendimiento en otros idiomas no esta validado.
- Los umbrales por defecto (0.5 binario, 0.35 por tipo) deben recalibrarse con datos independientes si se usa en produccion o en investigacion con requisitos de calibracion.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si de falsos positivos y falsos negativos en la deteccion de sesgo y de etiquetas espurias en la cabeza multi-etiqueta.
- La carga no es estandar: `AutoModelForSequenceClassification.from_pretrained()` falla; es necesario el procedimiento manual con `state_dict`, lo que complica la integracion en pipelines automatizados.
- Licencia Apache-2.0 permite uso comercial, pero el autor enfatiza el uso como apoyo a la reflexion critica y no como veredicto; conviene revisar las implicaciones eticas antes de integrarlo en productos de moderacion o puntuacion de medios.
- El dataset ELLUL se publicara por separado; los detalles de anotacion y composicion no estan incluidos en el repo del modelo, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timperator/xlm-r-biasscanner-ellul
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de la taxonomia (Menzner & Leidner, 2026): https://arxiv.org/abs/2601.05358
- Proyecto BiasScanner: https://biasscanner.org/
- Dataset ELLUL: pendiente de publicacion separada en Hugging Face (no disponible en el momento de la ficha)
