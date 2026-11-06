# Vishwasaidev/hand-weights

## Resumen

Hand Weights es un modelo de texto a imagen experimental publicado por el usuario Vishwasaidev en Hugging Face. Su particularidad es radical: sus 4.071 parametros fueron escritos a mano o derivados de formulas geometricas, sin dataset, sin entrenamiento y sin descenso de gradiente. Cada peso tiene una interpretacion directa, de modo que la fila 12 de un tensor de plano corresponde literalmente al borde izquierdo de un triangulo. Es, por tanto, un modelo juguete orientado a la interpretabilidad y a la docencia, no un sistema de generacion de imagenes de proposito general.

La arquitectura se organiza en cuatro etapas: un embedding de 83 palabras a vectores de 32 dimensiones con ranuras para forma, color, posicion, tamano, cielo y suelo; un binder con recurrencia con compuertas que propaga adjetivos y resuelve frases de posicion; un decodificador de ranuras con capas lineales y valores por defecto por forma; y un renderizador de tres capas basado en neuronas de semiplano, combinaciones AND/OR/AND-NOT y una neurona lineal de sombreado con compuerta de composicion alfa. El resultado se genera con NumPy y Pillow, sin dependencias de aprendizaje profundo.

Su relevancia es conceptual: responde a la afirmacion de que se pueden fijar pesos en un modelo nuevo sin entrenamiento. El autor demuestra que es posible cuando el modelo es diminuto y la tarea esta disenada para que cada neurona tenga una funcion nombrable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo no esta pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular con embedding, binder recurrente con compuertas, decodificador de ranuras y renderizador neuronal de semiplanos |
| Parametros totales | 4.071 (4.020 en `weights.safetensors` y 51 colores por parte en metadatos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (vocabulario de 83 palabras, sin contexto en tokens) |
| Tipos de cuantizacion | no disponible (pesos en precision nativa de NumPy) |
| Idiomas soportados | no disponible (vocabulario cerrado de palabras en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`weights.safetensors`) generado desde `handweights.py`, con metadatos de vocabulario, layout de embedding y estructura del renderizador |

## Arquitectura y entrenamiento

El modelo no se entrena. Todos sus parametros se escriben a mano o se derivan de geometria. La etapa de embedding mapea 83 palabras a vectores de 32 dimensiones con ranuras semanticas para forma, color, posicion, tamano, cielo y suelo. El binder aplica una recurrencia con compuertas implementada mediante mascaras, sin pesos libres: los adjetivos se propagan hacia el siguiente token de objeto y las frases de posicion como "on the left" se enlazan hacia atras con el ultimo objeto mencionado. El decodificador de ranuras usa capas lineales que recurren a colores, tamanos y alturas por defecto cuando el prompt no los especifica.

El renderizador consta de tres capas. La primera usa neuronas de semiplano por pixel con la forma `sigmoid(s·(d − nx·x − ny·y))`, donde cada fila de los tensores `renderer.<shape>.part<i>` codifica la normal `(nx, ny)` y el desplazamiento `d` de un borde. La segunda combina esos semiplanos con neuronas AND, OR y AND-NOT para construir figuras: un circulo con 32 aristas, una estrella como pentagono mas cinco triangulos, un corazon como dos circulos mas un triangulo y una luna como un circulo menos otro circulo. La tercera capa aplica una neurona lineal de sombreado con luz desde arriba a la izquierda y una compuerta de composicion alfa. Los cielos, el agua, la hierba y las estrellas de fondo son formulas escritas en codigo, no neuronas. El archivo `handweights.py` es la fuente de verdad y `export_weights.py` regenera el safetensors.

## Capacidades

- Generacion de imagenes sinteticas simples a partir de prompts en ingles con un vocabulario cerrado de 83 palabras.
- Renderizado de diez formas: circulo, cuadrado, triangulo, estrella, luna, corazon, casa, arbol, sol y nube, con sinonimos como ball, box, pyramid o home.
- Control de color con catorce opciones: red, green, blue, yellow, orange, purple, pink, white, black, brown, gray, cyan, gold y silver.
- Control de posicion (left, right, top/above, bottom/below, center) y de tamano (tiny, small, medium, big, huge).
- Fondos de escena predefinidos: day, sky, night, sunset, space, sea, grass, desert y snow, con sinonimos.
- Composicion de varias figuras en una misma imagen mediante el binder de adjetivos y posiciones.
- Sombreado con luz desde arriba a la izquierda y composicion alfa entre capas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues.
- No soporta modo thinking, vision, audio ni ninguna modalidad distinta de texto a imagen.

## Casos de uso

- Docencia de redes neuronales: inspeccionar `weights.safetensors` permite mostrar a estudiantes que cada numero tiene una funcion geometrica concreta, algo imposible en un modelo entrenado de gran tamano.
- Experimentos de interpretabilidad mecanicista: al no haber entrenamiento, se puede modificar una fila del tensor de un semiplano y observar de inmediato el efecto en el borde renderizado, sin necesidad de reentrenar.
- Prueba de concepto sobre pesos manuales: sirve para validar o refutar afirmaciones de que se pueden fijar pesos sin entrenamiento en modelos pequenos y tareas estructuradas.
- Generacion de iconos y diagramas simples en entornos sin GPU: al depender solo de NumPy y Pillow, se ejecuta en cualquier maquina, incluida una Raspberry Pi, para producir formas basicas.
- Test de pipelines de exportacion: `export_weights.py` y el volcado a safetensors permiten practicar la serializacion de pesos y metadatos en un caso minimo y totalmente auditable.
- Material de divulgacion: el Space asociado permite a un publico no tecnico escribir prompts y ver como el vocabulario cerrado limita y determina la salida, ilustrando el papel de la tokenizacion.
- Referencia negativa en evaluaciones: util como linea base trivial para comparar con modelos de texto a imagen reales y cuantificar la diferencia entre generacion aprendida y generacion programada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo completo ocupa unos pocos kilobytes en memoria y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU con Python, NumPy y Pillow.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, como contenedores ligeros o dispositivos embebidos.
- Opciones de despliegue: ejecucion directa con `python handweights.py "<prompt>"`, modo demo con `python handweights.py --demo` y el Space de Hugging Face alojado por el autor. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer ni usa pesos en formato GGUF.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo y la ausencia de operaciones matriciales grandes, se espera una latencia de milisegundos por imagen en CPU, aunque no se ha publicado una medicion.

## Comparativa con modelos similares

No hay modelos comparables directos en la informacion disponible. Los modelos de texto a imagen convencionales, como Stable Diffusion o DALL-E, se basan en difusion con cientos de millones o miles de millones de parametros entrenados y no admiten comparacion significativa en parametros, contexto ni licencia con este modelo juguete.

| Modelo | Parametros | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hand Weights | 4.071 | Ninguno (pesos manuales) | no disponible | MIT | Hugging Face, 0 descargas |
| Modelos de difusion de texto a imagen | Cientos de millones a miles de millones | Preentrenamiento masivo | Tokens de texto, variable | Variable segun modelo | Amplia |
| Modelos de texto a imagen basados en transformers | Variable | Preentrenamiento masivo | Variable | Variable | Amplia |

## Limitaciones y advertencias

- Vocabulario cerrado de 83 palabras: cualquier termino fuera de el se ignora, y la aplicacion muestra cuales se han descartado.
- No sabe contar: un prompt como "two clouds" dibuja una sola nube.
- No modela relaciones espaciales complejas: "a sun above a house" coloca ambos elementos, pero no garantiza la relacion descrita.
- No puede aprender ni generalizar; su utilidad esta acotada al diseno manual de cada neurona.
- No hay datos publicados sobre sesgos, alucinacion o comportamiento en dominios no previstos, aunque por su naturaleza determinista no genera texto ni contenido abierto.
- La licencia MIT permite uso comercial, pero el modelo no es adecuado para produccion por su alcance limitado y su naturaleza de juguete.
- No dispone de soporte multilingue: el vocabulario esta en ingles.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-03), por lo que no hay historial de uso ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishwasaidev/hand-weights
- Space de demostracion: https://huggingface.co/spaces/Vishwasaidev/hand-weights
- Repositorio del autor: no disponible
- Paper: no disponible
- Blog del autor: no disponible
