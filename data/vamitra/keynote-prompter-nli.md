# Vamitra/keynote-prompter-nli

## Resumen

Keynote Prompter NLI es una conversión a Core ML del modelo MoritzLaurer/deberta-v3-base-zeroshot-v2.0, un clasificador de inferencia de lenguaje natural (NLI) afinado para zero-shot classification. Lo publica el desarrollador Vamitra como componente interno de Keynote Prompter, una aplicación que marca puntos de un guion a medida que el orador habla. El modelo no se entrena de nuevo: se parte de los pesos originales de DeBERTa-v3-base y se cuantizan a int8 para ejecución en dispositivo (on-device) en iOS 18 y macOS 15 o superiores.

La relevancia del modelo es operativa más que de investigación: demuestra un patrón de despliegue de NLI privado y offline dentro de una app de escritorio y móvil, sin llamadas a servidor. El tamaño del repositorio es de 0,2 GB, coherente con un transformer base (~86 M de parámetros en DeBERTa-v3-base) cuantizado a int8. La licencia es MIT, heredada del modelo original y de Microsoft DeBERTa-v3-base.

Al ser una conversión de formato y no un modelo nuevo, sus capacidades coinciden con las del NLI original: decidir si una premisa implica una hipótesis, lo que permite clasificación zero-shot por comparación contra etiquetas expresadas como frases. La información disponible no incluye idiomas soportados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-base (NLI, clasificación de 3 vías en el original; salida de entailment en esta conversión) |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-base tiene ~86 M; la model card no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (input fijo `[1, 128]`: `[CLS] premise [SEP] hypothesis [SEP]`, con padding) |
| Tipos de cuantizacion | int8 lineal simétrica, cómputo en fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), con `manifest.json` que lista tamano y SHA-256 de cada archivo; pesos int8 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v3-base, el modelo de Microsoft con atención desacoplada y embeddings de posición relativos, afinado por Moritz Laurer para NLI y zero-shot classification (revisión `8e7e5af5983a0ddb1a5b45a38b129ab69e2258e8`). La conversión a Core ML no reentrena: los pesos son los originales redondeados a int8 lineal simétrico, con cómputo en fp16. La entrada se fija a una secuencia de 128 tokens en formato NLI estándar, y la salida es la probabilidad softmax de entailment, no los logits crudos.

La model card documenta tres cambios técnicos respecto al original. Primero, la cuantización int8 introduce diferencias de puntuación en el segundo o tercer decimal. Segundo, el enmascaramiento de padding se aplica solo por clave y no por consulta × clave: con la máscara original en fp16 las filas de padding producen NaN que se propagan a todas las salidas en CPU y GPU; la conversión verifica que las salidas de tokens reales no cambian. Tercero, algunos helpers de TorchScript se sustituyen por versiones equivalentes en Python plano para permitir la conversión. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO; esos detalles corresponden al modelo base, no incluidos en la información disponible.

## Capacidades

- Clasificación zero-shot mediante NLI: dado un par premisa-hipótesis, devuelve la probabilidad de que la premisa implique la hipótesis.
- Detección de cobertura de puntos de un guion: en la app, la premisa son las dos últimas frases del orador y la hipótesis es "The speaker says that <talking point>."; un punto se considera cubierto con umbral 0,5.
- Inferencia privada y offline en dispositivo, sin conexión a servidor.
- Ejecución en iOS 18 / macOS 15 o posteriores vía Core ML.
- No dispone de generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni capacidades de agente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Seguimiento de guiones en presentaciones: la app compara las últimas frases del orador con cada punto pendiente y marca cobertura al superar 0,5; el contexto de 128 tokens es suficiente porque la premisa se limita a dos frases.
- Verificación de checklist en entrevistas o demos guiadas: cada requisito se formula como hipótesis y se evalúa contra la transcripción reciente para detectar temas no tratados.
- Clasificación zero-shot de textos cortos en local: etiquetar reseñas, tickets o mensajes con categorías definidas como frases, sin entrenamiento adicional ni envío de datos a la nube.
- Moderación o filtrado previo en el dispositivo: comprobar si un fragmento de texto implica una política concreta antes de escalar a un modelo mayor en servidor.
- Asistencia a accesibilidad: seguimiento en tiempo real de puntos clave para personas con dificultades de memoria o para entrenamiento de oratoria.
- Enrutado ligero en pipelines: usar la probabilidad de entailment como señal barata para decidir si un texto cumple una condición y activar un proceso posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que las puntuaciones difieren del modelo original en el segundo o tercer decimal por la cuantización int8.

## Requisitos de hardware

- Inferencia en dispositivo Apple con Core ML: iPhone, iPad o Mac con iOS 18 / macOS 15 o posterior.
- VRAM/RAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB con pesos int8, por lo que la huella es del orden de cientos de MB.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el artefacto es Core ML y no está pensado para esos entornos.
- Cabe en hardware de consumo Apple (iPhone y Mac recientes); no se documenta soporte para GPU NVIDIA ni consumer PC.
- Opciones de despliegue: Core ML en apps iOS/macOS. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Vamitra/keynote-prompter-nli | no disponible (~86 M en el base) | 128 tokens | NLI / zero-shot classification | MIT | Core ML int8 |
| MoritzLaurer/deberta-v3-base-zeroshot-v2.0 | ~86 M | no disponible en esta información | NLI / zero-shot classification | MIT | safetensors (PyTorch) |
| microsoft/deberta-v3-base | ~86 M | 512 tokens (modelo base estándar) | encoder general | MIT | safetensors (PyTorch) |

La comparación relevante es con el modelo original: misma arquitectura y pesos, pero este último está cuantizado a int8 y empaquetado para Core ML, con contexto de entrada fijado a 128 tokens. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo NLI: no genera texto ni resuelve tareas fuera de la clasificación por entailment.
- Ventana de 128 tokens: premisas y hipótesis largas se truncan; no apta para documentos extensos.
- La cuantización int8 altera las puntuaciones en el segundo o tercer decimal respecto al original.
- El enmascaramiento de padding modificado es una decisión de conversión; aunque se verifica que las salidas de tokens reales no cambian, conviene validar en el caso de uso concreto.
- Idiomas soportados no documentados; el uso en la app está en inglés.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos o negativos en la detección de entailment, especialmente con umbrales fijos como 0,5.
- Sesgos: no documentados en la información disponible; hereda los del modelo base.
- Licencia MIT permite uso comercial, pero se recomienda conservar la atribución a Moritz Laurer y Microsoft indicada en la model card.
- Dependencia de plataforma: requiere iOS 18 / macOS 15 o superior y el runtime de Core ML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vamitra/keynote-prompter-nli
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0
- DeBERTa-v3-base de Microsoft: https://huggingface.co/microsoft/deberta-v3-base
