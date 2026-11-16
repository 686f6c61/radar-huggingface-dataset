# tanskin02/rail-world-model-camera-500step

## Resumen

Rail World Model — Camera-conditioned 500step es un modelo de investigación publicado por el usuario tanskin02 en Hugging Face, diseñado para generar vídeo ferroviario sintético a partir de una imagen inicial RGB, una descripción textual de la escena y una trayectoria de cámara definida fotograma a fotograma. No es un modelo de lenguaje: es un modelo de mundo (world model) de dinámica directa orientado a la predicción visual, construido como un adaptador LoRA sobre el modelo base nvidia/Cosmos3-Nano, un generador de vídeo de NVIDIA.

El modelo resuelve un problema muy concreto: dada una ruta de cámara conocida (matriz de acción de 188×9), sintetizar los 189 fotogramas correspondientes a 24 FPS que un observador vería al recorrer esa trayectoria en un entorno ferroviario. Se entrenó en dos fases: una primera de adaptación de apariencia sobre 107 imágenes RGB reales (con 13 de validación) y una segunda de condicionamiento de cámara sobre 240 muestras de pose de cámara virtuales y renderizadas (con 54 de validación), acumulando 500 pasos de entrenamiento.

Su relevancia es acotada pero específica: sirve como banco de pruebas para generación condicionada por cámara en dominios de infraestructura ferroviaria, y demuestra el uso de LoRA sobre Cosmos3-Nano para especializar un modelo de vídeo generalista en un dominio vertical. No incluye políticas de percepción de riesgo, planificación de ruta ni frenado robótico; esas funciones quedan explícitamente fuera del alcance del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (heredero de nvidia/Cosmos3-Nano) con LoRA sobre atención generativa y adaptación de la entrada de cámara |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (condicionado a 189 fotogramas de vídeo y un prompt de escena) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de escena se procesa con tokenizador de texto local; el README está en coreano) |
| Licencia | no disponible (el autor remite a las condiciones del modelo base y de cada archivo) |
| Formato de pesos | safetensors, DCP shards (6 shards del base), pesos VAE de Wan, tokenizador local, `runtime_support.zip` |
| Tamaño del repositorio | 34,4 GB |
| Entrada | Imagen RGB 832×480, prompt de escena, acción de cámara 188×9 |
| Salida | 189 fotogramas a 24 FPS |
| Modelo base | nvidia/Cosmos3-Nano |
| Entorno de ejecución | NVIDIA Linux, Cosmos Framework nativo, PyTorch 2.10.x; referencia Python 3.13.12, PyTorch 2.10.0+cu130, aarch64 |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Nano, un generador de vídeo condicionado por imagen, y añade un adaptador LoRA entrenado sobre las capas de atención generativa, junto con una modificación parcial de la entrada de cámara. La arquitectura subyacente es la del base (difusión para vídeo), y el adaptador no altera el esquema general: inyecta capacidad de condicionamiento por trayectoria de cámara sobre un modelo ya capaz de generar vídeo a partir de una imagen y un prompt.

El entrenamiento se organizó en dos etapas. La primera, de adaptación de apariencia al dominio ferroviario, usó 107 imágenes RGB reales con 13 de validación. La segunda, de condicionamiento de cámara, empleó 240 muestras de pose de cámara virtuales y renderizadas con 54 de validación, y se prolongó durante 200 actualizaciones adicionales hasta alcanzar los 500 pasos totales seleccionados como checkpoint final. El autor indica que se heredaron pesos de un entrenamiento ferroviario previo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO (no aplicables a un modelo de difusión de vídeo de este tipo).

Como innovación destacable, el modelo expone la trayectoria de cámara como una matriz de acción de 188×9 que condiciona la generación fotograma a fotograma, lo que permite control explícito del movimiento de cámara en lugar de delegarlo al prompt. El autor verificó la integridad de los pesos comparando 1.097 hashes de tensores en CPU tras combinar el adaptador con el base; advierte que la verificación de ejecución en GPU sobre hardware físico distinto queda pendiente.

## Capacidades

- Generación de vídeo image-to-video condicionada por una imagen inicial RGB de 832×480.
- Condicionamiento explícito por trayectoria de cámara: acepta una acción de 188×9 y produce 189 fotogramas a 24 FPS coherentes con esa ruta.
- Generación de secuencias de vídeo ferroviario sintético en entornos virtuales y renderizados.
- Adaptación de apariencia al dominio ferroviario a partir de imágenes RGB reales.
- Procesamiento de prompt de escena mediante tokenizador de texto local incluido en el repositorio.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No incluye percepción de riesgo, planificación de ruta ni políticas de frenado; el autor lo declara explícitamente fuera de alcance.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de percepción ferroviaria: el modelo produce secuencias de 189 fotogramas condicionadas por una ruta de cámara concreta, lo que permite augmentar datasets de visión con trayectorias controladas y etiquetas de pose conocidas.
- Simulación de recorridos de cabina para pruebas de algoritmos de conducción: dado un tramo y una trayectoria, se generan vídeos sintéticos que sirven como entrada reproducible para validar módulos de detección de vía o señalización.
- Prototipado rápido de escenarios: un investigador puede describir una escena con un prompt y definir la cámara, obteniendo un vídeo de referencia en minutos sin modelado 3D manual.
- Evaluación de modelos de mundo: el condicionamiento explícito por cámara permite medir la coherencia geométrica de la generación comparando la trayectoria solicitada con el movimiento aparente en el vídeo resultante.
- Investigación en adaptación LoRA sobre modelos de vídeo: el repositorio incluye el bundle de pesos, la receta de restauración, la configuración y los hashes, lo que lo convierte en un caso de estudio reproducible de especialización de Cosmos3-Nano.
- Docencia y divulgación sobre modelos generativos de vídeo: el pipeline completo (imagen, prompt, acción de cámara, salida de 189 fotogramas) es un ejemplo didáctico de condicionamiento estructurado en difusión de vídeo.
- Generación de material visual para revisión de infraestructura: recorridos sintéticos sobre trazados virtuales para previsualizar cómo se vería una cámara a bordo antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas cuantitativas de calidad de generación, FVD, coherencia de cámara ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 34,4 GB e incluye pesos base en 6 shards DCP, VAE de Wan, tokenizador y el bundle LoRA, por lo que se requiere almacenamiento amplio además de VRAM.
- GPU recomendadas: el autor especifica entorno NVIDIA Linux con Cosmos Framework nativo y PyTorch 2.10.x; no detalla modelos concretos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio y la necesidad de cargar el base completo más el adaptador sugieren que no es viable en GPUs de gama de consumo habituales, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: Cosmos Framework nativo con PyTorch 2.10.x; el repositorio incluye `runtime_support.zip` con el framework nativo, monitorización de recursos y el runner de tareas, además de `ENVIRONMENT.json` con las versiones exactas de paquetes Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.
- Entorno de referencia conservado: Python 3.13.12, PyTorch 2.10.0+cu130, aarch64.
- Verificación: hashes de 1.097 tensores comprobados en CPU; la ejecución en GPU sobre hardware físico distinto queda pendiente de validación adicional.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rail World Model — Camera-conditioned 500step | LoRA de difusión de vídeo sobre Cosmos3-Nano | no disponible | 189 fotogramas a 24 FPS, condicionado por cámara 188×9 | no disponible | Hugging Face (0 descargas, 0 likes) |
| nvidia/Cosmos3-Nano | Modelo base de generación de vídeo | no disponible | no disponible | según NVIDIA | Hugging Face (modelo base) |
| Alternativas de la misma categoría (world models ferroviarios con condicionamiento de cámara) | — | — | — | — | no disponible |

No se dispone de información sobre modelos comparables directos en la misma categoría (world models ferroviarios con condicionamiento explícito de cámara) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.
- La licencia no está declarada de forma explícita; el autor remite a las condiciones del modelo base nvidia/Cosmos3-Nano y de cada archivo, por lo que el uso comercial requiere revisar dichas condiciones antes de cualquier despliegue.
- El propio autor advierte que la verificación de ejecución en GPU sobre hardware físico distinto al de referencia está pendiente; la comprobación realizada se limita a hashes de tensores en CPU.
- El modelo no implementa percepción de riesgo, planificación de ruta ni políticas de frenado robótico; no debe usarse como componente de seguridad en sistemas ferroviarios reales.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir elementos inexistentes en la escena (señales, obstáculos, texturas) que no correspondan a la trayectoria solicitada.
- Idiomas soportados no documentados; el README está en coreano y no se especifica el comportamiento del tokenizador de texto con prompts en otros idiomas.
- Dependencia de un entorno muy específico (Cosmos Framework nativo, PyTorch 2.10.0+cu130, Python 3.13.12, aarch64), lo que dificulta la reproducibilidad fuera de esa configuración.
- El repositorio incluye documentación de revisión de derechos redactada antes de la publicación; el autor indica que el estado público actual debe consultarse en la descripción del repositorio.
- Tamaño del repositorio (34,4 GB) y necesidad de cargar el base completo más el adaptador: requiere infraestructura de almacenamiento y cómputo considerable.
- No se han publicado métricas de calidad, sesgos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanskin02/rail-world-model-camera-500step
- Modelo base nvidia/Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Código del proyecto: https://github.com/tanskin1011/rail-world-model
- Documentación de restauración de pesos y ejecución: https://github.com/tanskin1011/rail-world-model/blob/main/docs/WEIGHTS.md
- Descarga con revisión fijada: `hf download tanskin02/rail-world-model-camera-500step --revision 379bea5f3a00a51a1aaea402bc774a4e27669f37 --local-dir ./rail-world-model-artifacts`
