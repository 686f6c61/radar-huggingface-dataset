# TianhangCheng7/Anchor4D

## Resumen

Anchor4D es un sistema de generacion 4D (malla tridimensional animada en el tiempo) desarrollado por TianhangCheng7 que, a partir de un video y una malla triangular de referencia, produce la animacion de dicha malla siguiendo el movimiento observado en el video. No es un modelo de lenguaje ni un modelo multimodal conversacional, sino un pipeline de generacion de animacion de mallas basado en un VAE de anclajes y un generador condicionado por video que reutiliza la arquitectura DiT de R-DMesh.

El repositorio de Hugging Face (1,3 GB) contiene exclusivamente pesos: un VAE de anclajes (`anchor4d_vae.pt`, 147 MB), un generador de anclajes condicionado por video con estadisticas latentes y un codificador de caracteristicas de seguimiento de puntos (`anchor4d_generator.pt`, 635 MB), un contexto de texto nulo de Wan2.2 (`wan_context_null.pt`, 10 KB) y una version de R-DMesh afinada sobre los datos de entrenamiento de Anchor4D (`rdmesh_finetuned/`, 511 MB). El backbone de video Wan2.2-TI2V-5B no se incluye y debe descargarse aparte.

Su relevancia es acotada y muy especializada: sirve como referencia reproducible para investigacion en animacion de mallas guiada por video (video-to-4D), no como modelo de proposito general. El codigo de inferencia y entrenamiento vive en el repositorio de GitHub del autor, y la licencia es mixta (`anchor4d-mixed`), con componentes sujetos a terminos de terceros (R-DMesh de Tencent Hunyuan, AllTracker y Wan2.2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline generativo: VAE de anclajes + generador DiT condicionado por video (arquitectura R-DMesh DiT inicializada desde pesos de R-DMesh) + codificador de caracteristicas de seguimiento de puntos (AllTracker) + backbone de video Wan2.2-TI2V-5B (no incluido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa ventanas de secuencia de malla y frames de video) |
| Tipos de cuantizacion | no disponible (pesos en precision original `.pt` / `.pth`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el condicionamiento textual usa el codificador umT5 de Wan2.2, pero el contexto nulo esta precalculado) |
| Licencia | `anchor4d-mixed` (licencia personalizada; componentes con terminos de terceros: R-DMesh, AllTracker MIT, Wan2.2 Apache 2.0, AnimateAnyMesh Apache 2.0) |
| Formato de pesos | PyTorch (`.pt` y `.pth`) |

## Arquitectura y entrenamiento

Anchor4D se compone de dos piezas entrenadas: un VAE de anclajes que mapea ventanas de secuencias de malla a latentes de anclajes de forma 512 x 32, y un generador de anclajes condicionado por video que produce esos latentes a partir del video de entrada. El generador emplea la arquitectura DiT de R-DMesh y se inicializo desde los pesos publicados de R-DMesh; incorpora ademas un codificador de caracteristicas de seguimiento de puntos basado en AllTracker y estadisticas latentes. El backbone de video es Wan2.2-TI2V-5B, que no se distribuye en este repositorio y se descarga mediante `scripts/download_wan.py`. El VAE de anclajes adapta bloques de AnimateAnyMesh pero sus pesos se entrenaron desde cero.

El repositorio incluye tambien una version de R-DMesh afinada sobre los datos de entrenamiento de Anchor4D (20.000 pasos de generador), que corresponde a la linea base "R-DMesh†" del articulo. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo). Como innovacion tecnica destacable, el contexto de texto nulo de Wan2.2 esta precalculado (`wan_context_null.pt`), lo que evita cargar el codificador de texto de 11 GB durante la inferencia.

## Capacidades

- Animacion de mallas triangulares a partir de un video: dado un `.obj` y una secuencia de frames con parametros de camara, genera la malla animada cuadro a cuadro.
- Generacion 4D (geometria + tiempo): produce secuencias temporales de mallas, no un unico fotograma estatico.
- Condicionamiento por video: el movimiento se extrae del video de entrada; no requiere captura de movimiento ni rigging manual.
- Seguimiento de puntos: el codificador interno basado en AllTracker aporta caracteristicas de correspondencia para guiar la animacion.
- Integracion con el ecosistema Wan2.2: reutiliza el backbone de video Wan2.2-TI2V-5B y su codificador de texto umT5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto/codigo: no es un modelo de lenguaje.
- Capacidades multilingues: no aplicables.

## Casos de uso

- Investigacion en animacion guiada por video: reproducir el pipeline completo (VAE de anclajes + generador + Wan2.2) para comparar frente a R-DMesh y otras lineas base en tareas video-to-4D.
- Prototipado de animacion de personajes o assets 3D a partir de metraje real: se proporciona una malla base y un video de referencia para obtener la malla animada sin captura de movimiento dedicada.
- Generacion de contenido para videojuegos y previsualizacion: animar mallas de baja/media poligonizacion a partir de clips de referencia para iterar rapidamente en preproduccion.
- Evaluacion de modelos de generacion 4D: usar los pesos de R-DMesh afinado (`rdmesh_finetuned/`) como linea base reproducible con los mismos datos de entrenamiento que Anchor4D.
- Reentrenamiento y ajuste fino: el repositorio separa VAE, generador y linea base, lo que permite sustituir componentes o reentrenar el generador sobre nuevos dominios de malla.
- Docencia y divulgacion tecnica: ejemplo didactico de pipeline modular (VAE + DiT + backbone de video) para explicar generacion 4D en cursos de vision por computador.
- Integracion en herramientas de postproduccion: exportar mallas animadas para su uso en motores de render o en pipelines de efectos visuales, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos suman aproximadamente 1,3 GB, pero el backbone Wan2.2-TI2V-5B (5B parametros) debe descargarse aparte y domina el consumo; el codificador de texto se evita gracias a `wan_context_null.pt`.
- GPU recomendadas: no disponible. Por el tamano del backbone de video (5B parametros) y el procesamiento de secuencias de video, se requiere previsiblemente una GPU de datacenter (A100, H100) o una consumer de gama alta con suficiente VRAM; el autor no publica requisitos minimos.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia mediante `scripts/infer.py` del repositorio de GitHub (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anchor4D | Video-to-4D (VAE de anclajes + DiT + Wan2.2) | no disponible | no aplica | `anchor4d-mixed` | Pesos en HF, codigo en GitHub |
| R-DMesh (Tencent Hunyuan) | Animacion de mallas | no disponible | no aplica | Terminos de R-DMesh | Pesos y codigo publicos; linea base afinada incluida en este repo |
| AnimateAnyMesh | Animacion de mallas | no disponible | no aplica | Apache 2.0 | Codigo publico; bloques reutilizados en el VAE de Anchor4D |
| Wan2.2-TI2V-5B | Generacion de video texto-imagen | 5B | no aplica | Apache 2.0 | Pesos en HF; backbone usado por Anchor4D |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia mixta y restrictiva: `anchor4d-mixed` combina componentes con terminos distintos (R-DMesh de Tencent Hunyuan, AllTracker MIT, Wan2.2 Apache 2.0, AnimateAnyMesh Apache 2.0). El uso comercial requiere revisar cada componente por separado; no se garantiza un uso comercial sin restricciones.
- Dependencia de terceros: el generador usa la arquitectura DiT de R-DMesh y se inicializo desde sus pesos, por lo que quedan sujetos a los terminos de R-DMesh.
- Backbone no incluido: sin descargar Wan2.2-TI2V-5B el pipeline no es funcional; el repositorio por si solo no basta.
- Requiere malla de entrada y parametros de camara (`mesh.obj`, `camera.json`): no genera mallas desde cero ni funciona solo con video.
- Sin datos de sesgo, alucinacion o robustez publicados: no se han documentado evaluaciones de calidad, sesgos ni tasas de fallo en la informacion disponible.
- Sin soporte multilingue ni de texto: no es adecuado para tareas de NLP, codigo o conversacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado y sin garantias de mantenimiento.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/TianhangCheng7/Anchor4D
- Codigo (GitHub): https://github.com/Tianhang-Cheng/Anchor4D
- Backbone Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- R-DMesh (Tencent Hunyuan): https://github.com/Tencent-Hunyuan/R-DMesh
- AllTracker: https://github.com/aharley/alltracker
- AnimateAnyMesh: https://github.com/JarrentWu1031/AnimateAnyMesh
