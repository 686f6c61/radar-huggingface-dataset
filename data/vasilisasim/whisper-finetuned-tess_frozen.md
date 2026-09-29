# VasilisAsim/whisper-finetuned-TESS_frozen

## Resumen

`VasilisAsim/whisper-finetuned-TESS_frozen` es un checkpoint de la familia Whisper de OpenAI (arquitectura transformer encoder-decoder para audio) reentrenado por el usuario VasilisAsim para una tarea de clasificación de audio, según declara el pipeline del repositorio. El nombre del modelo indica que se ha ajustado sobre el corpus TESS (Toronto Emotional Speech Set), un conjunto de habla emocional en inglés con siete categorías afectivas, y que el ajuste se ha realizado con algún esquema de capas congeladas (el sufijo `frozen`). El repositorio es un experimento académico de carácter menor: cero descargas, cero likes y una model card autogenerada por la plantilla de Hugging Face en la que todos los apartados relevantes figuran como «More Information Needed».

El dato más concreto disponible es el recuento de parámetros de los pesos en safetensors: 20.723.719 parámetros, con un tamaño de repositorio de 0,1 GB. Esa cifra es notablemente inferior a la del Whisper tiny oficial (aproximadamente 39 millones de parámetros), el miembro más pequeño de la familia, lo que sugiere un checkpoint parcial o con alguna parte de la red recortada; no hay confirmación de ello en la documentación. El modelo se publicó el 28 de septiembre de 2026 y está etiquetado como compatible con Inference Endpoints.

Su relevancia práctica es limitada y muy acotada: sirve como punto de partida reproducible para experimentos de reconocimiento de emociones en habla (SER) y como ejemplo de ajuste de un encoder acústico preentrenado a un dataset pequeño. Para producción no es recomendable sin una validación previa, dado que no se publican métricas, licencia ni composición de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (no confirmado en la model card; inferido de las etiquetas `whisper` y `transformers`) |
| Parametros totales | 20.723.719 (recuento real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 s de audio por ventana (ventana estandar de la familia Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas en el repositorio |
| Idiomas soportados | no disponible (el corpus TESS esta en ingles, pero la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); libreria `transformers` |
| Tarea declarada | audio-classification |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 28 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Compatibilidad de despliegue | `endpoints_compatible` (Inference Endpoints de Hugging Face) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y que fue entrenado originalmente por OpenAI con 680.000 horas de audio debilmente supervisado para reconocimiento de voz multilingue, traduccion de voz e identificacion de idioma (paper arXiv:2212.04356). En este repositorio, el pipeline declarado no es `automatic-speech-recognition` sino `audio-classification`, lo que implica que la cabeza de decodificacion se ha sustituido o reutilizado para producir una etiqueta por clip en lugar de una secuencia de tokens.

El nombre del checkpoint indica un ajuste sobre TESS, un corpus de habla emocional en ingles compuesto por 2.800 enunciados de dos actrices que cubren siete emociones (ira, asco, miedo, felicidad, sorpresa agradable, tristeza y neutro). El sufijo `frozen` sugiere que durante el ajuste se congelaron total o parcialmente los pesos del modelo base y solo se entrenaron la cabeza de clasificacion o las capas superiores, un esquema habitual en datasets pequenos para evitar el sobreajuste. No hay informacion sobre el numero de tokens o horas de audio usados, la composicion exacta del dataset, hiperparametros, precision de entrenamiento, uso de RLHF/DPO ni ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). La model card no aporta ningun detalle de `Training Details` ni de `Evaluation`.

Un detalle a tener en cuenta: la etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre cuantificacion de emisiones de carbono, citado en la plantilla de model card de Hugging Face, y no a un articulo sobre el propio modelo. Es un artefacto del autogenerado, no una referencia metodologica.

## Capacidades

- Clasificacion de audio a nivel de clip: el pipeline declarado (`audio-classification`) devuelve etiquetas de clase, presumiblemente emociones en el caso de TESS, no transcripciones.
- Reconocimiento de emociones en habla (SER): es la capacidad inferida del nombre y del corpus de ajuste, no confirmada por metricas publicadas.
- Extraccion de representaciones acusticas: al derivar de un encoder Whisper, es plausible su uso como extractor de embeddings para tareas de audio, aunque no se documenta.
- Sin soporte documentado de tool calling, function calling ni uso como agente: no es una capacidad propia de un modelo de clasificacion.
- Sin capacidades de generacion de texto, razonamiento, codigo ni matematicas en su configuracion actual.
- Multilingue: no disponible; no hay declaracion de idiomas y el corpus de ajuste esta en ingles.
- Sin modo de razonamiento (thinking mode), sin vision y sin audio generativo.

## Casos de uso

- Analisis de emocion en centros de contacto: el modelo podria etiquetar la emocion predominante de cada segmento de llamada para generar informes agregados de tono del cliente; requiere validacion previa porque no hay metricas publicadas.
- Anotacion asistida de corpus de habla: usar las predicciones como preetiquetado en un pipeline de anotacion humana, reduciendo el coste de etiquetar grandes volumenes de audio antes de una revision manual.
- Investigacion academica en SER: servir como linea base reproducible frente a otros encoders (wav2vec2, HuBERT) en el mismo dataset TESS, ya que el autor publica variantes comparables.
- Indexacion y busqueda de archivos de audio: clasificar clips por tono afectivo para permitir busquedas del tipo «localiza fragmentos neutros» o «fragmentos con enfado» en archivos de medios.
- Aprendizaje activo sobre audio: seleccionar los clips con mayor incertidumbre de clasificacion para enviarlos a anotacion, optimizando el uso de presupuesto de etiquetado.
- Prototipos educativos y demos: al ocupar decimas de GB, es adecuado para talleres, cuadernos de Jupyter y entornos docentes donde se ensena ajuste de modelos de audio.
- Moderacion de contenido en audio: como filtro auxiliar de tono agresivo o alterado en plataformas de voz, siempre con supervision humana y acompanado de un clasificador validado, dado que este checkpoint no aporta garantias de precision.
- Deteccion de afecto en interfaces conversacionales: adaptar el tono de respuesta de un asistente de voz a la emocion detectada, con la advertencia de que no existe evidencia de robustez fuera del dominio de TESS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor incluye la seccion `Evaluation` con todos los campos como «More Information Needed» y el repositorio no contiene resultados de accuracy, F1 ni matrices de confusion sobre TESS ni sobre ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,09 GB en fp32 (unos 83 MB solo de pesos), 0,05 GB en fp16 y 0,03 GB en int8 con cuantizacion dinamica; con activaciones y buffers de audio, el consumo real se mantiene por debajo de 1 GB en todos los casos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una T4, una L4 o una RTX 3060 estan sobradamente dimensionadas. No se requiere A100 ni H100.
- Viabilidad en hardware de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU. Es plausible su ejecucion en dispositivos de borde tipo Raspberry Pi, aunque no hay datos de latencia publicados.
- Opciones de despliegue: `transformers` con `pipeline("audio-classification")`, Hugging Face Inference Endpoints (el repositorio esta etiquetado como `endpoints_compatible`), exportacion a ONNX o TorchScript mediante `optimum`. No se publican pesos en GGUF ni en formato whisper.cpp, y al tratarse de clasificacion y no de ASR, las herramientas de decodificacion de Whisper no son directamente aplicables.
- Latencia y throughput: no disponible. No hay ninguna medicion publicada de latencia por clip ni de clips por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VasilisAsim/whisper-finetuned-TESS_frozen | 20,7 M | audio-classification | 30 s de audio (estandar Whisper, no confirmado) | no disponible | Hugging Face, 0 descargas |
| VasilisAsim/whisper-finetuned-TESS | no disponible | audio-classification | 30 s de audio (no confirmado) | no disponible | Hugging Face (variante sin congelar del mismo autor) |
| VasilisAsim/wav2vec-base-finetuned-TESS | no disponible (wav2vec2-base, ~95 M tipicos) | audio-classification | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-tiny | ~39 M | automatic-speech-recognition, traduccion, identificacion de idioma | 30 s de audio | MIT | Hugging Face, ampliamente utilizado |

La comparacion cuantitativa de rendimiento no es posible: ninguno de los repositorios del autor publica metricas sobre TESS. La diferencia mas relevante es la licencia, ya que `wav2vec-base-finetuned-TESS` declara apache-2.0 mientras que `whisper-finetuned-TESS_frozen` no declara ninguna, y la de `openai/whisper-tiny` es MIT.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Es un bloqueante para cualquier despliegue en produccion hasta que el autor lo aclare.
- Ausencia total de metricas: no se publica accuracy, F1, matriz de confusion ni validacion cruzada, por lo que no hay evidencia de que el modelo funcione mejor que el azar en la tarea declarada.
- Riesgo de sobreajuste elevado: un corpus como TESS (2.800 enunciados, dos voces femeninas, ingles, habla actuada) es muy pequeno y poco diverso; un clasificador ajustado sobre el puede no generalizar a otras voces, acentos, edades, ruido de fondo o emociones espontaneas.
- Sesgo de dominio y de hablante: el modelo puede aprender a identificar a las dos actrices en lugar de la emocion. No se documenta ningun control al respecto.
- Idiomas: no se declara soporte multilingue y el ajuste es en ingles, por lo que su uso en castellano no esta justificado ni validado.
- Alucinacion y falsos positivos en clasificacion: al no haber umbrales de confianza documentados, las etiquetas pueden ser incorrectas con alta confianza, lo que es especialmente peligroso si se usa para moderacion o cribado.
- Caveat sobre el recuento de parametros: 20,7 M es inferior al Whisper tiny oficial, lo que apunta a un checkpoint parcial o recortado; conviene inspeccionar la configuracion y el tokenizer antes de integrarlo.
- Caveat sobre el sufijo `frozen`: no se especifica que capas se congelaron ni que se entreno exactamente, lo que dificulta reproducir o extender el ajuste.
- Fecha de creacion inusualmente futura (2026) y ausencia de historial: el repositorio no tiene descargas ni comunidad, por lo que no hay senal externa de calidad.
- Uso etico: la inferencia de emociones a partir de la voz es una tecnologia con implicaciones de privacidad y puede ser inexacta; su aplicacion sobre personas reales deberia requerir consentimiento y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VasilisAsim/whisper-finetuned-TESS_frozen
- Variante sin congelar del mismo autor: https://huggingface.co/VasilisAsim/whisper-finetuned-TESS
- Variante con wav2vec2 (licencia apache-2.0): https://huggingface.co/VasilisAsim/wav2vec-base-finetuned-TESS
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Repositorio de ajuste de Whisper (whisper-finetune): https://github.com/vasistalodagala/whisper-finetune
- Ficha de registro del modelo hermano wav2vec2: https://free2aitools.com/model/vasilisasim/wav2vec-finetuned-tess
- Articulo sobre cuantificacion de emisiones citado en la plantilla (etiqueta `arxiv:1910.09700`): https://arxiv.org/abs/1910.09700
- Referencia del modelo base Whisper (familia): https://arxiv.org/abs/2212.04356
