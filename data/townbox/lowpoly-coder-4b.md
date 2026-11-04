# townbox/lowpoly-coder-4b

## Resumen

LowPoly Coder 4B es un ajuste fino de Qwen3.5-4B desarrollado por townbox, orientado a una tarea muy concreta: transformar una peticion de una sola frase (por ejemplo, "Make a low-poly okapi") en codigo JavaScript para Three.js r180 que construye ese objeto como un asset 3D de bajo poligonaje. El modelo combina una fase de especificacion breve con la generacion de un bloque de codigo que define `buildAsset(THREE)`, devolviendo un `THREE.Group` de mallas nombradas con sombreado plano y una paleta fija.

Se trata de un fine-tune con adaptadores LoRA fusionados sobre la arquitectura de Qwen3.5-4B (`Qwen3_5ForConditionalGeneration`), aunque se emplea en modo solo texto. Con 4.659.865.088 parametros y pesos bf16 distribuidos en 2 shards safetensors (~9.3 GB), esta pensado para generar assets 3D exportables a `.glb` mediante el script `export_glb.mjs` incluido en el repositorio. Su licencia es Apache-2.0 y solo declara soporte para ingles.

El modelo es honesto sobre sus limites: en una prueba ciega con 90 objetos no vistos, solo el 24,0% de las salidas fue reconocible como el objeto solicitado, y menos del 1% se califico como "bueno". La recomendacion del autor es muestrear varias respuestas (4 a 8) y quedarse con la mejor, ya que un unico intento suele ser debil o estar roto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B, `Qwen3_5ForConditionalGeneration`), fine-tune con LoRA fusionado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 12.288 tokens en la configuracion de vLLM probada (`max_model_len=12288`); la ventana nativa del modelo base no se especifica |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 2 shards, ~9.3 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Qwen3.5-4B, un transformer de 4.659 millones de parametros con la clase `Qwen3_5ForConditionalGeneration` propia del modelo base, que en origen admite entradas de imagen y texto. En este fine-tune, sin embargo, se usa exclusivamente en modo texto: la configuracion de referencia desactiva las entradas de imagen y video (`limit_mm_per_prompt={"image": 0, "video": 0}`). Los adaptadores LoRA se han fusionado en los pesos, de modo que se carga como un modelo denso estandar con `transformers` o vLLM.

El entrenamiento se realizo sobre el dataset `townbox/lowpoly-coder-4b-data`, cuyos ejemplos de primera fase fueron escritos por DeepSeek V4.1 Flash. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. El contrato de salida (formato de la especificacion, convenciones de ejes, estilo y paleta de colores) esta definido en `system_prompt.md`, que debe enviarse literalmente como mensaje de sistema, ya que el modelo fue entrenado con el. La generacion se realiza con thinking desactivado (`enable_thinking=False`) y temperaturas de muestreo concretas (temperature 0.7, top_p 0.8, top_k 20, max_tokens 8192).

## Capacidades

- Generacion de codigo JavaScript para Three.js r180 que construye objetos 3D de bajo poligonaje.
- Produccion de una especificacion breve de 4 lineas (Asset, Triangle budget, Brief, Required named parts) antes del codigo.
- Generacion de mallas con nombres, sombreado plano (`MeshStandardMaterial`) y colores de una paleta fija (oak, darkWood, ivory, iron, brass, sage, navy, black, rust).
- Seleccion autonoma del presupuesto de triangulos: entre 250 y 1.100 en el conjunto de prueba, con mediana de 550.
- Respeto de convenciones geometricas: Y hacia arriba, objeto apoyado en y = 0, frente hacia +Z, escala libre.
- Salida convertible a `.glb` mediante `export_glb.mjs` (extraccion del bloque de codigo, ejecucion en `node:vm` con limite de 10 segundos y escritura de GLB con un nodo por malla).
- No soporta tool calling ni function calling segun la documentacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo thinking (de hecho, el thinking se desactiva).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion de props para prototipado de videojuegos: el modelo convierte una descripcion breve en una malla Three.js que se exporta a `.glb` e importa en motores o visores, acelerando la creacion de assets placeholder con un estilo visual coherente.
- Creacion de maquetas 3D para visualizacion web: integrado en un pipeline que llama al modelo, ejecuta `export_glb.mjs` en un contenedor aislado y sirve el `.glb` en una pagina con Three.js, permite generar objetos como lavadoras, roveres lunares u okapis para demos interactivas.
- Generacion por lotes con seleccion posterior: dado que la tasa de acierto reconocible es del 24,0%, el flujo recomendado es muestrear 4 a 8 respuestas por peticion y seleccionar la mejor; esto encaja en tareas donde el coste de generar varios candidatos es bajo frente al de modelar a mano.
- Pruebas de concepto de estilo "woodland collection": al usar una paleta y un estilo fijos, el modelo es util para generar colecciones de objetos visualmente homogeneos en prototipos o escenas de ejemplo.
- Educacion y aprendizaje de Three.js: los scripts generados, con mallas nombradas y geometria simple, sirven como ejemplos legibles de como construir objetos 3D procedurales con esta libreria.
- Integracion en herramientas de autorria asistida: como componente de un editor que propone un primer borrador de asset a partir de una frase, que el artista revisa y retoca, aprovechando la estructura de especificacion mas codigo.

## Benchmarks y rendimiento

Prueba ciega con 90 peticiones de objetos no vistos, en 10 categorias, con 2 intentos por peticion (180 salidas). Cada salida se renderizo desde 6 vistas y fue puntuada de 0 a 3 por 5 evaluadores ciegos (modelos de IA), con una concordancia de Krippendorff alfa = 0,81. Una puntuacion de 2 o mas cuenta como reconocible.

| Metrica | LowPoly Coder 4B | DeepSeek V4.1 Flash (genero los ejemplos de entrenamiento) |
|---|---:|---:|
| Salidas reconocibles (puntuacion >= 2) | 24,0% | 93,7% |
| Salidas calificadas como "buenas" | < 1% | No disponible |
| Presupuesto de triangulos (rango / mediana) | 250-1.100 / 550 | No disponible |

En una prueba aparte, las 12 respuestas reales convertidas con `export_glb.mjs` pasaron el validador glTF de Khronos con 0 errores y 0 avisos, y sus recuentos de mallas y triangulos coincidieron exactamente con los del entorno de evaluacion. El autor menciona que en modelos estrechamente relacionados la seleccion del mejor de 8 candidatos mediante un modelo de vision (GPT-6.1 Terra puntuando vistas renderizadas) elevo la tasa de reconocibles entre 23 y 28 puntos, pero subraya que esto no se midio para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 9.3 GB, por lo que se necesitan al menos ~10-11 GB de VRAM para cargar el modelo sin cuantizar, mas memoria para el contexto (hasta 12.288 tokens en la configuracion probada).
- GPU recomendadas: el autor valido con vLLM 0.33.0; GPUs de centro de datos como A100 o H100 son adecuadas, y tarjetas de consumo con 16 GB o mas (RTX 4090, RTX 4080 con margen justo) pueden alojar los pesos bf16.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM (RTX 4090, por ejemplo) en bf16; no se documentan cuantizaciones GGUF para reducir requisitos.
- Opciones de despliegue: vLLM 0.33.0 es la configuracion probada; tambien es compatible con `transformers` por ser un modelo estandar safetensors. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion puede requerir hasta 8192 tokens de salida y el muestreo de 4 a 8 respuestas por peticion multiplica el coste.

## Comparativa con modelos similares

No se dispone de datos de otros modelos especializados en generacion de codigo Three.js low-poly en la informacion proporcionada. La unica referencia cuantitativa es DeepSeek V4.1 Flash, que genero los ejemplos de entrenamiento y obtuvo un 93,7% de salidas reconocibles frente al 24,0% de este modelo.

| Modelo | Parametros | Contexto | Salidas reconocibles | Licencia |
|---|---|---|---|---|
| LowPoly Coder 4B | 4,66 B | 12.288 (config. probada) | 24,0% | Apache-2.0 |
| Qwen3.5-4B (base) | 4 B (clase) | No disponible | No disponible | No disponible en la informacion |
| DeepSeek V4.1 Flash | No disponible | No disponible | 93,7% | No disponible |

## Limitaciones y advertencias

- Calidad baja: solo el 24,0% de las salidas fue reconocible como el objeto solicitado y menos del 1% se califico como "bueno"; un unico intento suele ser debil o estar roto.
- Es necesario muestrear varias respuestas (4 a 8) y seleccionar la mejor, lo que incrementa el coste de inferencia.
- El codigo generado es no confiable: `export_glb.mjs` debe ejecutarse en un contenedor o VM aislados, sin red ni secretos, porque `node:vm` no es una frontera de seguridad.
- Solo ingles: no se declara soporte de otros idiomas.
- Estilo y paleta fijos: el modelo produce siempre el mismo estilo "woodland collection" y una paleta concreta, sin texturas; no es adecuado para otros estilos visuales.
- Capacidades limitadas al dominio: no soporta tool calling, agentes, vision ni thinking mode, a pesar de heredar la arquitectura multimodal del modelo base.
- Licencia Apache-2.0: permisiva para uso comercial, pero el autor no ofrece garantias sobre la calidad de los assets generados.
- Riesgo de alucinacion y geometria incorrecta: la especificacion que el modelo escribe puede no corresponder al objeto solicitado, y las mallas pueden ser irreconocibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/townbox/lowpoly-coder-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/townbox/lowpoly-coder-4b-data
- Three.js: https://threejs.org
- Script de exportacion a GLB: https://huggingface.co/townbox/lowpoly-coder-4b/blob/main/export_glb.mjs
- Contrato de salida (system prompt): https://huggingface.co/townbox/lowpoly-coder-4b/blob/main/system_prompt.md
