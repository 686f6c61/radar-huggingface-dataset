# zhenqis123/TactoHand

## Resumen

TactoHand es un modelo de vision por computador orientado a la estimacion de interacciones mano-objeto a partir de video RGB. Desarrollado por zhenqis123 y publicado en Hugging Face, el modelo predice para ambas manos cuatro magnitudes: contacto, proximidad, fuerza normalizada y visibilidad. Se trata, por tanto, de un modelo de percepcion fisica de la interaccion, no de un generador de texto ni de un modelo multimodal conversacional.

La arquitectura se apoya en un backbone DINOv3 ViT-L (Vision Transformer Large, parches de 16x16) inicializado a partir de los pesos de `timm/vit_large_patch16_dinov3.lvd1689m`. El modelo opera sobre ventanas de 32 fotogramas muestreados a 10 Hz (es decir, 3,2 segundos de video) con entradas de 256 pixeles. El repositorio ocupa 5,8 GB e incluye un checkpoint (`tactohand.ckpt`) acompanado de un YAML de configuracion de inferencia portable.

Su relevancia radica en que permite estimar contacto y fuerza sin sensores tactiles fisicos ni assets MANO en tiempo de inferencia, lo que facilita su integracion en pipelines de vision existentes. La licencia del codigo propio es MIT, aunque los pesos derivados de DINOv3 quedan sujetos a la licencia upstream de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv3 ViT-L, parches 16x16) sobre ventanas de video |
| Parametros totales | no disponible (backbone ViT-L, del orden de cientos de millones; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 32 fotogramas a 10 Hz (3,2 s de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (segun metadatos; relevante para documentacion, no para la tarea visual) |
| Licencia | MIT (contribuciones propias); pesos DINOv3 sujetos a DINOv3 License |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) + configuracion YAML (`tactohand.yaml`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone DINOv3 ViT-L, un transformer de vision con parches de 16x16, inicializado desde los pesos publicos de `timm`. Sobre este backbone, TactoHand procesa ventanas de 32 fotogramas muestreados a 10 Hz con resolucion de entrada de 256 pixeles, y produce predicciones por mano de contacto, proximidad, fuerza normalizada y visibilidad. No se dispone de informacion detallada sobre la cabeza de prediccion, el numero exacto de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

El checkpoint publicado conserva estado de entrenamiento ademas de los pesos de inferencia, y se acompania de un YAML que actua como configuracion portable. La inferencia solo con RGB no requiere assets MANO ni datasets preprocesados, lo que simplifica el despliegue. Las salidas de fuerza son predicciones normalizadas y no fuerzas fisicas en newtons. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Estimacion de contacto mano-objeto a partir de video RGB para ambas manos.
- Prediccion de proximidad entre mano y objeto.
- Prediccion de fuerza normalizada (no calibrada en newtons).
- Prediccion de visibilidad de cada mano.
- Procesamiento de video en ventanas de 32 fotogramas a 10 Hz.
- Inferencia solo con RGB, sin necesidad de assets MANO ni datasets preparados.
- No dispone de generacion de texto, tool calling, agentes ni razonamiento multi-step.
- No dispone de capacidades de audio ni de vision general mas alla de la tarea mano-objeto.

## Casos de uso

- Analisis de destreza manual en video: el modelo estima contacto, proximidad y fuerza normalizada por mano, lo que permite evaluar la calidad de agarres en grabaciones de manipulacion de objetos sin instrumentar al sujeto con sensores.
- Robotica de imitacion a partir de video humano: las predicciones de contacto y fuerza pueden servir como senal de supervision para entrenar politicas de agarre en robots que aprenden de demostraciones RGB.
- Evaluacion de ergonomia y rehabilitacion: el seguimiento de visibilidad y proximidad de ambas manos en ventanas de 3,2 s facilita medir patrones de uso de la mano en tareas repetitivas o terapias de recuperacion.
- Anotacion automatica de datasets de interaccion: el modelo puede preetiquetar contacto y proximidad en grandes corpus de video, reduciendo el coste de anotacion manual para entrenar otros modelos.
- Analisis de video deportivo o artistico: permite detectar momentos de contacto mano-objeto (por ejemplo, lanzamientos o golpeos) y estimar la intensidad relativa del contacto mediante la fuerza normalizada.
- Control e inspeccion en entornos de fabricacion: con camaras RGB existentes, el modelo puede monitorizar interacciones mano-herramienta y senalar contactos anomalos o falta de visibilidad de la mano.
- Investigacion en percepcion fisica: al no requerir MANO ni datasets preparados, es adecuado como baseline reproducible para estudiar estimacion de fuerza desde video en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas; el repositorio de pesos ocupa 5,8 GB, lo que sugiere que el checkpoint en precision completa requiere al menos varios GB de memoria, pero no se publica una estimacion oficial.
- GPU recomendadas: no disponible de forma explicita; por el tamano del backbone ViT-L, se espera que quepa en GPUs de consumo con memoria suficiente, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia via checkpoint PyTorch y YAML de configuracion; el repositorio de codigo (`BeingBeyond/Tactohand`) es la referencia de uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de estimacion de contacto y fuerza mano-objeto desde video RGB con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa. Cualquier tabla comparativa con alternativas concretas requeriria datos no disponibles.

## Limitaciones y advertencias

- Las salidas de fuerza son predicciones normalizadas, no fuerzas fisicas en newtons; no deben interpretarse como medidas fisicas calibradas.
- El modelo trabaja sobre ventanas de 32 fotogramas a 10 Hz; interacciones fuera de esa escala temporal o con cambios bruscos pueden no representarse bien.
- La resolucion de entrada es de 256 pixeles, lo que limita el detalle de objetos pequenos o manos parcialmente ocluidas.
- La inferencia esta disenada para RGB; no se documenta robustez frente a condiciones de iluminacion adversas, oclusiones severas o camaras multiples.
- Riesgo de sesgo derivado del dataset de entrenamiento (no documentado en la informacion disponible): posibles diferencias de rendimiento segun demografia, tipo de mano u objetos.
- Riesgo de alucinacion de contacto o fuerza en escenas ambiguas, comun en modelos de percepcion fisica; conviene validar en el dominio de despliegue.
- Licencia: las contribuciones propias son MIT, pero los pesos del backbone derivados de DINOv3 quedan sujetos a la DINOv3 License, lo que puede imponer restricciones adicionales para uso comercial. Es necesario revisar `LICENSE-DINOv3.md` antes de produccion.
- El checkpoint conserva estado de entrenamiento; debe usarse junto con el YAML correspondiente para una inferencia correcta.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware, lo que dificulta planificar capacidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zhenqis123/TactoHand
- Codigo y uso: https://github.com/BeingBeyond/Tactohand
- Paper: https://arxiv.org/abs/2610.39585
- Sitio del proyecto: https://zhenqis123.github.io/tactohand-site/
- Backbone base (timm): https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
