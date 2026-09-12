# wasedabiolab/coca-multitask-exp

## Resumen

Coca for Multitask es un repositorio experimental publicado por wasedabiolab en HuggingFace que contiene una implementación propia de una arquitectura denominada Coca, orientada a tareas multitarea y configurada en escala "tiny". Se trata de un artefacto de investigación y desarrollo, no de un modelo entrenado: el propio autor indica que el fichero `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y que no se presenta como un checkpoint con resultados de benchmark.

El modelo ocupa aproximadamente 33 088 parámetros, una magnitud propia de una configuración de juguete pensada para inspeccionar cambios arquitectónicos antes de lanzar un entrenamiento completo. La arquitectura emplea atención multi-query, fusión por concatenación seguida de MLP, activación approx gelu y normalización layernorm, según la tabla incluida en la model card del autor.

Su relevancia actual es limitada y muy acotada al ámbito de la ingeniería de modelos: sirve como plantilla reproducible para experimentar con recetas de entrenamiento multitarea, como punto de partida para adaptadores y como caso de prueba de canalizaciones de carga de pesos. No existe evidencia pública de entrenamiento, evaluación ni capacidad funcional, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación propia; atención multi-query, fusión concat + MLP, approx gelu, layernorm) |
| Parametros totales | 33 088 (dato extraído de `model.safetensors`) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización); código en `model.py` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Coca", una implementación personalizada que no corresponde a ninguna familia estándar documentada en el repositorio. Los únicos datos técnicos disponibles son los de la tabla del autor: atención de tipo multi-query, fusión de modalidades o ramas mediante concatenación seguida de una capa MLP, función de activación approx gelu y normalización layernorm. La escala es "tiny" y el repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No hay evidencia de que se haya completado ningún entrenamiento. La model card es explícita al respecto: la receta incluida usa el optimizador novograd con un schedule de tipo "step", pero se indica que son valores de partida del script y no prueba de una ejecución finalizada. El checkpoint publicado se describe como inicialización para pruebas de humo. Tampoco se documentan volumen de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto: no verificada. El checkpoint es una inicialización sin entrenamiento, por lo que no hay evidencia de que produzca texto coherente.
- Razonamiento, matemáticas y código: no verificados y sin datos que los respalden.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El autor define el modelo como "multitask", pero no detalla qué tareas concretas cubre.
- Capacidad real y verificable a fecha de publicación: servir como código de ejemplo ejecutable y como contenedor de pesos de inicialización para pruebas de carga.

## Casos de uso

- Pruebas de humo de canalizaciones de carga: el repositorio permite verificar que un pipeline propio es capaz de leer `model.safetensors`, instanciar la arquitectura desde `config.json` y ejecutar una pasada hacia delante sin errores, con un coste de cómputo mínimo.
- Plantilla de arquitectura para experimentos multitarea: los ficheros `model.py`, `config.json` y `training_args.json` sirven como base para modificar bloques de atención, fusión o normalización y comparar variantes antes de escalar a un entrenamiento real.
- Baseline de capacidad mínima en comparaciones controladas: al ser un modelo "tiny" sin entrenar, puede usarse como referencia inferior en experimentos donde se quiera medir cuánta capacidad aporta realmente el entrenamiento frente a una inicialización aleatoria.
- Desarrollo de adaptadores y compatibilidad con frameworks: dado que la model card advierte que las API de carga genéricas requieren un adaptador explícito, el repositorio es útil para implementar y depurar ese adaptador en librerías de terceros.
- Docencia y formación técnica: es un ejemplo compacto para explicar cómo se estructura una implementación de transformer personalizada en PyTorch, con atención multi-query y fusión por concatenación, sin necesidad de infraestructura GPU.
- Pruebas de integración en CI/CD: puede integrarse en flujos de integración continua para validar que los scripts de entrenamiento arrancan, que los argumentos se parsean correctamente (`python model.py --help`) y que los artefactos de configuración son coherentes.
- Punto de partida para un entrenamiento propio: un equipo que quiera desarrollar un modelo multitarea de pequeña escala puede partir de esta base, asumiendo que deberá aportar el dataset, el cómputo y la evaluación completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. Cualquier cifra de MMLU, HumanEval, GSM8K u otros conjuntos sería inventada y no se incluye.

Como orientación metodológica, el propio autor sugiere que una primera evaluación útil usaría un conjunto de validación específico de tarea, reportaría la métrica correspondiente en al menos tres semillas aleatorias e incluiría una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: el recuento de parámetros (33 088) implica un peso aproximado de 0,13 MB en fp32 y de 0,066 MB en fp16, sin contar el grafo de activaciones. Cabe holgadamente en cualquier GPU, en CPU e incluso en entornos embebidos.
- GPU recomendadas: no se requiere GPU. Cualquier acelerador (A100, H100, RTX 4090, o integradas) es sobredimensionado para este tamaño; la ejecución en CPU es suficiente.
- Cabe en GPU de consumo: sí, en cualquier modelo, incluidos los de gama de entrada y las GPU integradas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La model card advierte que, al ser una implementación personalizada, las API de carga automática requieren un adaptador explícito; el punto de entrada previsto es `python model.py`.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, la latencia estaría dominada por el lanzamiento del proceso y no por el cómputo del modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, y cualquier comparación con modelos "tiny" de otras familias (por ejemplo, variantes pequeñas de BERT o GPT) carecería de datos verificables, ya que este repositorio no publica métricas ni detalles de entrenamiento. Cualquier tabla comparativa requeriría fijar primero una tarea concreta, un conjunto de datos y una línea base de capacidad equivalente.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Es una inicialización y, por tanto, sus salidas no deben interpretarse como predicciones útiles.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según la propia model card.
- Riesgo de alucinación: total y estructural. Al no existir entrenamiento, no hay conocimiento factual subyacente que pueda ser correcto o incorrecto.
- Longitud de contexto: no documentada, lo que impide planificar cualquier aplicación con ventanas largas.
- Idiomas: no declarados. No hay base para asumir soporte multilingüe.
- Documentación insuficiente para producción: no se especifican datos de entrenamiento, tokenizador, formato de prompt ni métricas.
- Confusión potencial de nomenclatura: "coca" también designa una arquitectura conocida de imagen-texto (CoCa). Este repositorio no declara relación con ella y su ámbito declarado es multitarea, no visión-lenguaje.
- Licencia: MIT, que permite uso comercial, modificación y redistribución, pero el estado experimental del artefacto hace desaconsejable cualquier uso productivo. La propia model card recuerda revisar por separado los términos de los datos de origen si se combina con conjuntos externos.
- Los resultados de una futura versión entrenada deberán documentarse de forma separada de los valores por defecto aquí incluidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wasedabiolab/coca-multitask-exp
- Los resultados de la búsqueda web proporcionados no guardan relación con este modelo (contenido sobre ajedrez y la plataforma Lichess), por lo que no se incluye ningún enlace adicional de esa fuente.
- No se han encontrado en la información disponible enlaces a papers, blogs técnicos, repositorios de código adicionales ni demos.
