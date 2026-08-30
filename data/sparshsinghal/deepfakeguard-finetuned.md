# sparshsinghal/deepfakeguard-finetuned

## Resumen

DeepfakeGuard es un modelo de clasificación de audio desarrollado por Sparsh Singhal que detecta si una voz es real o generada por inteligencia artificial. Se trata de un fine-tuning del modelo `garystafford/wav2vec2-deepfake-voice-detector` sobre un conjunto de datos específico de voces indias, tanto reales como sintéticas. El modelo aborda el problema creciente de los deepfakes de voz, que se utilizan en fraudes telefónicos, suplantación de identidad y desinformación.

La arquitectura se basa en wav2vec2, un modelo transformer preentrenado de Meta AI para representaciones de audio, adaptado mediante una cabeza de clasificación binaria. El modelo tiene 315,7 millones de parámetros y un tamaño de 1,3 GB en formato safetensors. Su relevancia radica en ofrecer una herramienta open source con licencia MIT para la detección de voces sintéticas, un área donde la mayoría de soluciones son propietarias o están limitadas a entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (fine-tuned de `garystafford/wav2vec2-deepfake-voice-detector`) |
| Parametros totales | 315.701.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (entrenado con voces indias en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de wav2vec2, un transformer preentrenado de forma autosupervisada sobre audio sin etiquetar, que aprende representaciones latentes de la senal acustica. Sobre esta base se anade una capa de clasificacion para distinguir entre voz real y voz sintetica. El fine-tuning se realizo sobre un conjunto de 2016 muestras balanceadas (50% reales, 50% generadas por IA) de hablantes indios, con 5 epocas, batch size de 8 y learning rate de 3e-5. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. La innovacion principal es la especializacion en voces indias, un nicho poco cubierto por los detectores genericos.

## Capacidades

- Clasificacion binaria de audio: distingue entre voz real y voz generada por IA.
- Especializacion en acentos y entonaciones de hablantes indios en ingles.
- Inferencia directa mediante el pipeline `audio-classification` de Hugging Face Transformers.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio generativo ni otras modalidades.

## Casos de uso

- Verificacion de identidad en centros de atencion telefonica: el modelo puede analizar en tiempo real si la voz del interlocutor es sintetica, ayudando a prevenir fraudes de suplantacion en banca o servicios publicos.
- Autenticacion biometrica por voz: integrado en sistemas de acceso que requieren confirmacion de voz, detecta intentos de suplantacion con voces clonadas.
- Moderacion de contenido en plataformas de audio: permite filtrar audios subidos por usuarios que contengan voces sinteticas no declaradas, especialmente en redes sociales o servicios de mensajeria.
- Analisis forense de evidencias: en investigaciones judiciales o periodisticas, se puede aplicar a grabaciones para determinar si una voz ha sido manipulada o generada artificialmente.
- Proteccion de sistemas de pago por voz: en asistentes de voz para transacciones, el modelo anade una capa de seguridad contra ataques de reproduccion o clonacion.
- Investigacion academica sobre deepfakes: sirve como herramienta de referencia para estudiar la detectabilidad de voces sinteticas en contextos multilingues y multiculturales.

## Benchmarks y rendimiento

Segun la model card del autor, el modelo alcanza una precision del 100% y un F1 del 100% en el conjunto de test, compuesto por 250 muestras reales y 250 falsas, sin falsos positivos ni falsos negativos. Sin embargo, estos resultados deben interpretarse con cautela: el conjunto de test es pequeno y el entrenamiento se realizo sobre un dataset limitado, lo que sugiere un posible sobreajuste. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o similares, ya que se trata de una tarea de clasificacion de audio y no de texto. No hay comparaciones con otros detectores de deepfake de voz en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32, 0,7 GB en fp16, y menos de 0,5 GB con cuantizacion a int8 (estimacion basada en el tamano del modelo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3060 o superiores. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatible con GPUs de consumo: si, cabe en tarjetas de gama media y baja.
- Opciones de despliegue: se puede usar directamente con el pipeline de Transformers, exportar a ONNX para inferencia optimizada, o servir con FastAPI para aplicaciones en tiempo real.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la longitud del audio de entrada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (deteccion de deepfake de voz con wav2vec2) dentro de los datos proporcionados. Existen otros detectores de deepfake de audio en el ecosistema, pero no se han encontrado referencias concretas con especificaciones comparables. Por tanto, esta seccion queda como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con voces indias en ingles; puede no generalizar bien a otros acentos, idiomas o condiciones de grabacion (ruido, calidad del microfono).
- El conjunto de entrenamiento es pequeno (2016 muestras) y el resultado del 100% en test sugiere un posible sobreajuste; se recomienda validar en datos externos antes de usarlo en produccion.
- No se han documentado sesgos especificos, pero al estar limitado a un grupo demografico, podria tener un rendimiento desigual en otras poblaciones.
- La licencia MIT permite uso comercial, pero el modelo base `garystafford/wav2vec2-deepfake-voice-detector` podria tener restricciones adicionales; es necesario verificar su licencia antes de un despliegue comercial.
- No se proporcionan garantias de robustez frente a ataques adversariales o tecnicas de evasion de detectores.
- El modelo no distingue entre diferentes tipos de generacion (TTS, voice conversion, etc.), solo clasifica como real o fake.

## Enlaces

- HuggingFace: https://huggingface.co/sparshsinghal/deepfakeguard-finetuned
- Modelo base (mencionado en la model card): https://huggingface.co/garystafford/wav2vec2-deepfake-voice-detector
- No se han encontrado otros enlaces relevantes en la busqueda web (los proyectos homonimos en GitHub e IEEE tratan sobre deteccion de deepfake en imagenes y video, no en audio).
