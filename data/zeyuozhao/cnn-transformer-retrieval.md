# zeyuozhao/cnn-transformer-retrieval

## Resumen

El repositorio `zeyuozhao/cnn-transformer-retrieval` es una implementación propia y compacta en PyTorch de una arquitectura híbrida CNN-Transformer orientada a tareas de recuperación (retrieval) multimodal. Lo publica el usuario zeyuozhao y se distribuye bajo licencia Apache 2.0. No se trata de un modelo entrenado, sino de un punto de partida experimental: la propia model card indica que el fichero `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y revisión de código, y que no se presenta como un checkpoint con resultados de referencia.

El dato más relevante es su tamaño real: el recuento de parámetros de los pesos publicados es de 33.088 parámetros, muy lejos de lo que sugiere la etiqueta `huge` de la configuración generada. El repositorio ocupa 0,0 GB y contiene únicamente `run.py`, `README.md`, `config.json`, `training_args.json` y el checkpoint de inicialización. Según la configuración declarada, la arquitectura combina atención de ventana deslizante (sliding window) con fusión mediante co-atención (co attention), activación GELU y normalización LayerNorm.

Su relevancia actual es limitada y de carácter metodológico: sirve como esqueleto reproducible para experimentos controlados de retrieval, para revisiones de código de arquitecturas híbridas CNN-Transformer y como base para construir adaptadores que permitan cargarlo con APIs genéricas. No hay resultados de benchmarks publicados ni evidencia de un entrenamiento completo de la receta incluida (AdamW con planificador polinómico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer híbrida con atención de ventana deslizante y fusión por co-atención |
| Parametros totales | 33.088 (según `model.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la ventana de atención es deslizante, sin valor numérico publicado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declara ningún idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado); código en PyTorch |

Otros datos de configuración declarados en la model card: escala `huge`, activación GELU, normalización LayerNorm, optimizador por defecto AdamW y planificador polinómico.

## Arquitectura y entrenamiento

La arquitectura se describe como una CNN-Transformer para retrieval, con atención de ventana deslizante y fusión mediante co-atención. El uso de co-atención es coherente con tareas de emparejamiento entre dos modalidades o dos secuencias (por ejemplo, texto e imagen), donde cada torre atiende a la representación de la otra para construir una representación conjunta. La combinación de capas convolucionales con bloques transformer sugiere un diseño híbrido que busca capturar patrones locales mediante convolución y dependencias de mayor alcance mediante atención. No se especifican el número de capas, la dimensión oculta, el número de cabezas ni el tamaño exacto de la ventana deslizante.

No hay evidencia de entrenamiento: la model card afirma explícitamente que el checkpoint es una inicialización válida y que no se reclama ninguna puntuación de benchmark. La receta por defecto (AdamW con planificador polinómico) son valores de arranque del script, no el resultado de una ejecución completada. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni el uso de RLHF, DPO u otras fases de alineamiento. La propia documentación recomienda que cualquier evaluación futura se haga sobre Flickr30k, con la métrica de la tarea reportada en al menos tres semillas y con una línea base de capacidad equivalente, manteniendo los mismos datos, presupuesto de ajuste y semillas aleatorias entre todas las variantes comparadas.

## Capacidades

- Recuperación multimodal (retrieval): el diseño incorpora co-atención para fusionar dos modalidades, lo que apunta a tareas de recuperación texto-imagen o similar. Sin pesos entrenados, esta capacidad es únicamente arquitectónica y no funcional.
- Generación de texto: no disponible; no hay evidencia de que el modelo incluya cabeza de lenguaje entrenada.
- Razonamiento, matemáticas y código: no disponibles.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Visión: la co-atención sugiere procesamiento de pares de modalidades, pero no se documenta un codificador visual concreto ni pesos entrenados.
- Modo thinking: no disponible.
- Capacidad especial real: el checkpoint es una inicialización válida para pruebas de humo y para verificar que el pipeline de carga funciona. Al ser una implementación personalizada, las APIs automáticas genéricas requieren un adaptador explícito antes de poder usarlo.

## Casos de uso

- Revisión de código de arquitecturas híbridas: el fichero `run.py` contiene el modelo y un punto de entrada ejecutable, de modo que se puede auditar cómo se implementan la ventana deslizante y la co-atención sin necesidad de descargar pesos de gran tamaño.
- Pruebas de humo en pipelines de entrenamiento: al ser un checkpoint de inicialización de 33.088 parámetros, permite comprobar que el bucle de entrenamiento, el guardado en safetensors y la carga posterior funcionan antes de escalar a configuraciones mayores.
- Experimentos controlados de ablación: sirve para comparar variantes de fusión (co-atención frente a concatenación o atención cruzada simple) y de ventana de atención en un entorno de coste computacional despreciable.
- Reproducción de una línea base de retrieval: la model card propone evaluar en Flickr30k con al menos tres semillas y una línea base de capacidad equivalente; el repositorio aporta el esqueleto para montar ese protocolo.
- Docencia y formación: es un ejemplo compacto y legible de implementación propia en PyTorch, útil para explicar la diferencia entre convolución y atención y cómo se combinan en un bloque híbrido.
- Desarrollo de adaptadores de integración: dado que las APIs automáticas de carga no funcionan directamente con implementaciones personalizadas, el repositorio es un caso práctico para escribir un adaptador que exponga el modelo a `transformers` u otras librerías.
- Verificación de infraestructura en CI: al no requerir GPU ni apenas memoria, se puede incluir en pruebas automáticas de integración continua que validen el entorno de PyTorch y el formato safetensors.
- Punto de partida para investigación en retrieval: un equipo puede tomar la configuración y escalarla, reutilizando la receta AdamW más planificador polinómico como referencia inicial documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que no se reclama ninguna puntuación y que la evaluación futura debería realizarse sobre Flickr30k, reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 33.088 parámetros, el peso en fp32 ocupa aproximadamente 132 KB y en fp16 unos 66 KB; las activaciones de una pasada de prueba son igualmente mínimas.
- GPU recomendadas: ninguna en particular. Cualquier GPU, incluso integrada, es suficiente; el modelo está pensado para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo y también en CPU sin aceleración. No hay requisito de VRAM relevante.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de implementación personalizada. El uso previsto es la ejecución directa del script de PyTorch (`python run.py --help`).
- Latencia y throughput estimados: no disponibles. Dado el tamaño, cualquier medición estaría dominada por la sobrecarga del framework y no por el cómputo del modelo.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con modelos de retrieval multimodales como CLIP o ALIGN, porque este repositorio no publica pesos entrenados, no declara métricas y su recuento de parámetros es varios órdenes de magnitud inferior al de esos sistemas.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeyuozhao/cnn-transformer-retrieval | 33.088 | no disponible | ninguno | Apache 2.0 | pesos de inicialización |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card recomienda comparar contra una línea base de capacidad equivalente, pero no identifica ninguna concreta ni aporta sus cifras.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier salida que produzca es la de una inicialización aleatoria y no tiene utilidad práctica en producción.
- No ha sido auditado en robustez, equidad ni transferencia de dominio; la propia documentación lo señala.
- No se declaran idiomas soportados ni cobertura lingüística.
- No hay resultados de benchmarks, por lo que no se puede estimar su calidad en ninguna tarea.
- El etiquetado `huge` de la configuración no se corresponde con el recuento real de 33.088 parámetros; conviene no interpretar la etiqueta como indicador de tamaño.
- Al ser una implementación personalizada, las APIs automáticas de carga de librerías genéricas requieren un adaptador explícito; intentar cargarlo como un modelo estándar fallará.
- La licencia Apache 2.0 permite el uso comercial del repositorio, pero la propia model card advierte de que hay que revisar por separado los términos de los datos de origen si se usa con conjuntos de datos externos.
- Riesgo de alucinación: no evaluable, porque el modelo no está entrenado y no se documenta una tarea generativa.
- Cualquier resultado obtenido a partir de un checkpoint futuro entrenado debe documentarse de forma separada de los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeyuozhao/cnn-transformer-retrieval

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su arquitectura o su autor: los resultados obtenidos correspondían a foros de programas de recompensas sin relación con el repositorio. Por tanto, no hay papers, blogs, repositorios auxiliares ni demos que enlazar además de la propia página de HuggingFace.
