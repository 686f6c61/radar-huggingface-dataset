# ZibinDong/ActionCodec2

## Resumen

ActionCodec2 es un tokenizador de acciones para robótica publicado por ZibinDong en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo de lenguaje: convierte secuencias de acciones de robot (desplazamientos del efector final o posiciones articulares) en secuencias de tokens discretos y las reconstruye, de modo que un modelo visión-lenguaje-acción (VLA) pueda tratarlas con el mismo formalismo que tokens de texto. El repositorio se etiqueta como `robotics`, `action-tokenization`, `actioncodec2` y pipeline `robotics`, e indica 0 descargas y 0 likes en el momento de la consulta.

El paquete distribuye 30 variantes de tokenizador que comparten un único runtime y una extensión nativa opcional en C++17. Las variantes se diferencian en el orden del predictor (primer o segundo orden), el nivel de precisión física de la cuantización (Paper, 1 mm, 5 mm y 10 mm), el presupuesto de tokens por perfil (1024, 2048, 4096, 8192 o 16384) y el perfil de acciones soportado (`joint`, `eef` o ambos). La variante por defecto es `single_eef_delta`, con traslación en metros, incremento de vector de rotación en radianes en el marco del cuerpo y comando binario absoluto de pinza.

Su relevancia es doble. Por un lado, la página del proyecto lo describe como un tokenizador de acciones en streaming sin entrenamiento (*training-free*), construido a partir de primitivas de cobertura mínimas, con error de seguimiento acotado de forma demostrable y empaquetado Set-BPE sin pérdidas. Por otro, el artículo asociado de la primera versión (ActionCodec, arXiv 2602.15397) sostiene que el diseño de tokenizadores de acciones se ha centrado en la fidelidad de reconstrucción sin atender a su impacto directo en la optimización de los VLA, que es el problema que esta segunda iteración aborda. El repositorio incluye además un paquete de inferencia para políticas VLA (`actioncodec2-0.1.0.tar.gz`) con el que se validaron seis políticas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador de acciones sin entrenamiento (*training-free*), basado en primitivas de cobertura mínimas con empaquetado Set-BPE sin pérdidas; no es un transformer generativo |
| Parámetros totales | No disponible (el repositorio no publica recuento de parámetros; usa assets ajustados por variante) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de atención; presupuesto de tokens por perfil según variante: 1024, 2048, 4096, 8192 o 16384 |
| Tipos de cuantización | Niveles de precisión física de la acción: Paper, 1 mm, 5 mm y 10 mm (cuantización con pérdida); no se publican cuantizaciones de pesos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible (no procesa lenguaje; el paquete de política incluye su propio tokenizador de texto) |
| Licencia | Apache-2.0 para el runtime y los assets ajustados; el archivo fuente contiene componentes G0.5 bajo `LICENSE-G0.5` |
| Formato de pesos | No disponible en safetensors ni GGUF; assets ajustados por variante con `variants.json` y `artifact_manifest.json`, archivo fuente `actioncodec2-0.1.0.tar.gz` y kernels C++17 opcionales |
| Orden del predictor | Primer orden (`-1st`) o segundo orden (`-2nd`) |
| Espacio de acción por defecto | `single_eef_delta`: traslación en metros, vector de rotación en radianes en marco del cuerpo, pinza binaria absoluta (abre con valores >= 0,8) |
| Convención de rotación | `R_next = R_previous @ Exp(rotvec)` |
| Frecuencia de trabajo | Remuestreo interno a 15 Hz; el `fps` real de grabación se pasa explícitamente |
| Formas de entrada y salida | Entrada `(T, D)` o `(B, T, D)`; salida en CPU `float32` con forma `(B, T_out, D)` |
| Número de variantes | 30 (2 de paper, 14 de primer orden extendidas, 14 de segundo orden extendidas) |

## Arquitectura y entrenamiento

ActionCodec2 no sigue el esquema de un transformer con atención: es un códec de acciones componible. La página del proyecto lo describe como un tokenizador en streaming construido a partir de primitivas de cobertura mínimas, con cota demostrable de error de seguimiento y empaquetado Set-BPE sin pérdidas. El repositorio distribuye 30 variantes que comparten el mismo runtime y, opcionalmente, kernels nativos en C++17 que se compilan una sola vez para todas ellas. Los identificadores de token de los perfiles `joint` y `eef` ocupan espacios de nombres disjuntos, de modo que ambos conviven sin colisión, y los niveles de precisión (Paper, 1 mm, 5 mm, 10 mm) describen ajustes de cuantización física del espacio de acciones.

El punto técnico más delicado es la dependencia entre fragmentos. Las variantes de segundo orden requieren el movimiento de primer orden precedente en cada frontera de chunk: se obtiene con `first_order_template(batch_size=...)` —plantilla de ceros solo si se sabe que el movimiento previo es nulo— y se actualiza con `final_first_order(tokens, previous_first_order=..., executed_steps=...)`. Para chunks ejecutados parcialmente, `executed_steps` indica el número de pasos realmente ejecutados. El tokenizador remuestrea a 15 Hz, por lo que la longitud de salida puede diferir de la de entrada, y la cuantización es declaradamente con pérdida. Los layouts absolutos requieren `current_state` para la reconstrucción, y el layout se cambia con `for_action_space("single_joint7_delta")` o cualquier otro registrado. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO; la documentación disponible presenta el método como libre de entrenamiento, en contraste con el códec neuronal de la primera versión del trabajo.

## Capacidades

- Codificación y decodificación de trayectorias de acción con formas `(T, D)` y `(B, T, D)`, devolviendo tensores `float32` en CPU con forma `(B, T_out, D)`.
- Remuestreo temporal: acepta la frecuencia real de grabación mediante `fps` y normaliza internamente a 15 Hz.
- Selección explícita de variante mediante `variant=` en `AutoProcessor.from_pretrained`, con carga conjunta de configuración y assets ajustados.
- Cambio de convención física de entrada con `for_action_space(...)`: perfil de efector final (`single_eef_delta`) o articular (`single_joint7_delta`), entre otros layouts registrados.
- Soporte de layouts absolutos, que exigen `current_state` para reconstruir la acción.
- Codificación de segundo orden con gestión de fronteras de chunk (`first_order_template`, `final_first_order`) y de ejecución parcial (`executed_steps`).
- Persistencia y carga offline: `save_pretrained` genera un procesador con los assets seleccionados y el runtime portable completo, más `artifact_manifest.json` con hashes y origen.
- Verificación de integridad: `variants.json` registra los hashes de assets de cada variante y su identificador de repositorio previo; la carga descarga los ficheros compartidos más la variante elegida y verifica sus assets.
- Control de ejecución nativa: `ACTIONCODEC2_NUM_THREADS` fija el presupuesto de hilos por proceso y `ACTIONCODEC2_NO_NATIVE=1` fuerza la implementación de referencia en Python.
- Paquete de inferencia VLA (`actioncodec2[cuda]`) con código de inferencia de políticas, kernels nativos, recetas de entrenamiento y scripts de evaluación; cada política incluye sus assets AC2 y su tokenizador de texto, y funciona offline tras la descarga completa.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo *thinking*: su alcance es exclusivamente la tokenización de acciones.

## Casos de uso

- Entrenamiento e inferencia de modelos VLA: el tokenizador convierte los chunks de acción del dataset en secuencias discretas con un presupuesto de tokens controlado (1024 a 16384), lo que permite fijar el coste de secuencia del modelo de política antes de entrenar.
- Teleoperación en streaming: al ser un tokenizador sin entrenamiento y con remuestreo a 15 Hz, puede codificar la señal de un dispositivo maestro en tiempo de captura y transmitir tokens en lugar de trayectorias completas.
- Registro y transmisión con ancho de banda limitado: enviar tokens con presupuesto de 1k o 2k reduce el volumen frente a la trayectoria densa, aceptando el error de cuantización de 5 mm o 10 mm según la variante elegida.
- Replanificación con chunks parcialmente ejecutados: `executed_steps` y `final_first_order` permiten cerrar el chunk en el punto real de ejecución y conservar la coherencia de segundo orden en la siguiente predicción.
- Compatibilidad entre morfologías: el mismo runtime cubre perfiles `joint` y `eef` con espacios de identificadores disjuntos, lo que facilita pipelines que mezclan brazos articulares y efector final en un mismo corpus.
- Reproducibilidad de experimentos: fijar `revision` a un commit concreto y conservar `variants.json` y `artifact_manifest.json` permite reconstruir exactamente la tokenización usada por una política publicada.
- Despliegue en entornos sin GPU para la capa de tokenización: el códec corre en CPU y los kernels C++17 opcionales se compilan una vez; solo la política VLA requiere CUDA.
- Evaluación de políticas: el archivo fuente incluye scripts de evaluación y recetas de entrenamiento, reutilizables para comparar el efecto de distintas variantes sobre una misma política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto afirma una cota demostrable de error de seguimiento y empaquetado Set-BPE sin pérdidas, y el repositorio menciona seis políticas validadas con el paquete `actioncodec2-0.1.0`, pero no se incluyen tablas de MMLU, HumanEval, GSM8K ni métricas de reconstrucción con valores numéricos. No se han inventado cifras.

## Requisitos de hardware

- VRAM para el tokenizador: no aplica. La decodificación devuelve tensores `float32` en CPU y no se documenta uso de GPU para el códec.
- Kernels nativos: requieren compilador C++17; se instalan una vez para todas las variantes con `pip install ./actioncodec2-kernels` tras descargar `setup.py`, `pyproject.toml`, `LICENSE` y `actioncodec2_kernels/*`.
- Alternativa sin compilación: `ACTIONCODEC2_NO_NATIVE=1` selecciona la implementación de referencia en Python; el coste de latencia de esta ruta no está documentado.
- Concurrencia: `ACTIONCODEC2_NUM_THREADS` acota el presupuesto de hilos por proceso.
- Políticas VLA asociadas: el paquete `actioncodec2[cuda]` requiere GPU con CUDA; no se publican requisitos de VRAM ni GPU recomendadas (A100, H100, RTX 4090 u otras).
- Despliegue: la vía documentada es `transformers.AutoProcessor` con `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El proyecto se describe como apto para streaming, pero sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Orden | Presupuesto de tokens | Perfiles | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ActionCodec2 (`ZibinDong/ActionCodec2`) | Tokenizador de acciones sin entrenamiento | 1 y 2 | 1024–16384 según variante | `joint`, `eef` | Apache-2.0 (con componentes G0.5 en el archivo fuente) | Hugging Face, 30 variantes |
| ActionCodec (primera versión, `ZibinDong/actioncodec`) | Códec neuronal de acciones | No disponible | No disponible | No disponible | No disponible en la información consultada | Repositorio GitHub y artículo arXiv 2602.15397 |
| ActionCodec2-Extended-10mm-2k | Variante publicada del mismo tokenizador | 1 | 2048 | `eef` | Apache-2.0 | Repositorio propio en Hugging Face |

No se dispone de datos de otros tokenizadores de acciones comparables (presupuesto de tokens, perfiles soportados, licencia o métricas) en la información proporcionada, por lo que la comparación cuantitativa con alternativas externas se marca como no disponible.

## Limitaciones y advertencias

- La cuantización es con pérdida: la decodificación no reproduce exactamente la trayectoria original, y el error depende del nivel de precisión elegido (Paper, 1 mm, 5 mm o 10 mm).
- El remuestreo a 15 Hz puede alterar la longitud de la secuencia respecto a la entrada, lo que afecta a la alineación temporal si no se tiene en cuenta.
- Una política entrenada debe usar su variante original de tokenizador; mezclar variantes invalida la correspondencia entre tokens y acciones.
- Las variantes de segundo orden exigen el movimiento de primer orden precedente en cada frontera de chunk; usar la plantilla de ceros cuando el movimiento previo no es nulo introduce error.
- Los layouts absolutos requieren `current_state` para la reconstrucción; sin ese estado la decodificación es incompleta.
- Las variantes `1mm/2k` contienen únicamente perfiles `eef`, lo que restringe su uso en robots articulares.
- `subfolder` no selecciona variante: la única vía es cargar el catálogo y usar `variant=`. Un uso incorrecto lleva a cargar assets que no corresponden.
- La licencia Apache-2.0 cubre el runtime y los assets ajustados, pero el archivo fuente incluye componentes G0.5 bajo `LICENSE-G0.5` y un `NOTICE`; es necesario revisarlos antes de un uso comercial del paquete de inferencia.
- No se documentan sesgos del tokenizador; al operar sobre magnitudes físicas, cualquier sesgo procede de los datos de las políticas y no del códec.
- No hay métricas publicadas de fidelidad de reconstrucción, latencia ni throughput, ni análisis de fallo en horizontes largos; la validación disponible se limita a seis políticas según el repositorio.
- El repositorio registra 0 descargas y 0 likes en la fecha de los datos, lo que indica una adopción aún nula y ausencia de validación independiente.
- La carga requiere `trust_remote_code=True` y ejecuta código del repositorio; conviene fijar `revision` a un commit concreto y verificar hashes para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZibinDong/ActionCodec2
- Colección ActionCodec2: https://huggingface.co/collections/ZibinDong/actioncodec2
- Página del proyecto: https://zibindong.github.io/actioncodec2-page/
- Repositorio GitHub de ActionCodec: https://github.com/ZibinDong/actioncodec
- Artículo ActionCodec: What Makes for Good Action Tokenizers: https://arxiv.org/abs/2602.15397
- Variante publicada ActionCodec2-Extended-10mm-2k: https://huggingface.co/ZibinDong/ActionCodec2-Extended-10mm-2k
