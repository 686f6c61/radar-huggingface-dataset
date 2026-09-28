# Yichenhuf/perceiver-demo-2024

## Resumen

Yichenhuf/perceiver-demo-2024 es un prototipo de investigación basado en la arquitectura Perceiver, orientado a tareas de *matching* (emparejamiento entre modalidades o entradas). Lo publica el usuario Yichenhuf como repositorio de demostración, con una configuración de escala «nano» cuyo único checkpoint (`model.safetensors`) contiene 24.832 parámetros y se describe explícitamente como una inicialización válida para pruebas de humo, no como un modelo entrenado.

El interés del repositorio es metodológico más que de rendimiento. La model card documenta los valores por defecto de la arquitectura (atención dilatada, fusión mediante *co-attention*, activación GELU/Tanh, normalización GroupNorm) y la receta de entrenamiento prevista (AdamW con *linear warmup*), dejando claro que no se reclama ninguna métrica de benchmark. Además, advierte de que la implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas.

Se trata, por tanto, de un artefacto de arranque para investigación reproducible: sirve para fijar formatos de fichero, comprobar flujos de carga y servir de base a experimentos controlados con un *baseline* de capacidad equivalente. No es un modelo desplegable en producción ni un componente listo para tareas reales, y así lo declara su propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención dilatada, fusión *co-attention*) |
| Parametros totales | 24.832 (dato real leído del safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint en safetensors; no se documentan esquemas de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

Otros datos de configuración declarados en la model card: escala «nano», activación GELU/Tanh, normalización GroupNorm, optimizador AdamW con planificador *linear warmup*. Tamaño del repositorio: 0,0 GB. Descargas: 0. «Likes»: 0. Fecha de creación y última actualización: 2026-09-28 (ambas el mismo día).

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer capaz de operar sobre entradas de tamaño arbitrario proyectándolas primero sobre un conjunto latente de tamaño fijo. En esta configuración concreta se especifican tres decisiones de diseño: atención de tipo dilatada, mecanismo de fusión mediante *co-attention* (atención cruzada mutua entre dos ramas de entrada, coherente con una tarea de emparejamiento) y normalización GroupNorm en lugar de LayerNorm. La activación combinada es GELU/Tanh y la escala declarada es «nano», con 24.832 parámetros totales, lo que sitúa al modelo tres o cuatro órdenes de magnitud por debajo de un transformer pequeño convencional.

No hay información sobre datos de entrenamiento: no se especifica número de tokens, composición del dataset, ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. La receta incluida en `training_args.json` (AdamW con *linear warmup*) se presenta como valores de partida del script, «no como evidencia de una ejecución completada». El repositorio incluye `inference.py` como artefacto principal, `config.json` con los ajustes de arquitectura generados, `training_args.json` con la receta por defecto y `model.safetensors` como inicialización. La model card indica que la evaluación adecuada requeriría un conjunto de validación emparejado, métricas de tarea sobre al menos tres semillas y un *baseline* de capacidad equivalente.

## Capacidades

No se documenta ninguna capacidad funcional verificada. En concreto:

- Generación de texto: no disponible; no hay evidencia de que el modelo esté entrenado para generar texto.
- Razonamiento, código y matemáticas: no disponible.
- Visión: no disponible, aunque la familia Perceiver se ha usado habitualmente con entradas multimodales.
- *Tool calling* / *function calling*: no soportado según la información disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (*thinking mode*, audio, etc.): no disponible.
- Lo único verificable es la existencia de un *forward pass* de inicialización ejecutable a través de `inference.py`, pensado para pruebas de humo.

## Casos de uso

Dado que el checkpoint no está entrenado, los casos de uso son de investigación, docencia e infraestructura, no de aplicación final.

- Pruebas de humo de un pipeline MLOps: cargar `model.safetensors`, verificar que el formato y la serialización safetensors se leen correctamente y que el grafo de cómputo se instancia sin errores antes de invertir tiempo en un entrenamiento real.
- Punto de partida para experimentos de *matching*: servir como esqueleto reproducible sobre el que definir la tarea de emparejamiento (por ejemplo, pares texto-texto o imagen-texto) y comparar contra un *baseline* de capacidad equivalente, tal y como recomienda la propia model card.
- Ablaciones controladas de arquitectura: al ser una implementación propia y diminuta (24.832 parámetros), permite medir el efecto de cambiar atención dilatada por atención densa, o *co-attention* por concatenación, con un coste computacional despreciable y en pocos segundos por experimento.
- Docencia de arquitecturas Perceiver: el repositorio incluye un `inference.py` con un bloque `__main__` de ejemplo, útil para ilustrar el flujo de proyección a latentes y atención cruzada en un curso de deep learning.
- Validación de infraestructura de despliegue: comprobar que un *runner* de inferencia, un contenedor o una función serverless son capaces de cargar modelos safetensors personalizados y de aplicar un adaptador explícito, dado que las APIs genéricas de carga automática no funcionan sin él.
- Banco de pruebas de exportación y cuantización: usar este checkpoint mínimo para verificar herramientas de conversión de safetensors a otros formatos o de empaquetado, antes de aplicarlas a modelos de mayor tamaño donde los errores son más costosos.
- Base para un futuro *fine-tuning* a pequeña escala en CPU: con 24.832 parámetros, un ajuste completo o parcial es viable en hardware sin GPU, lo que permite iterar sobre la receta de entrenamiento (semillas, presupuesto de *tuning*, exposición de datos) antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización, no un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en `float32` ocupa aproximadamente 0,1 MB (24.832 parámetros × 4 bytes); en `float16`, unos 50 KB; en `int8`, unos 25 KB. Estas cifras son cálculos derivados del recuento de parámetros, no datos publicados. El consumo real en ejecución vendrá dominado por el *overhead* del framework (PyTorch y sus dependencias), del orden de cientos de MB de RAM.
- GPU recomendadas: no se especifica ninguna. Dado el tamaño, cualquier GPU sirve, e incluso es innecesaria.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e integrada. También cabe en CPU, en dispositivos de borde y en una Raspberry Pi.
- Opciones de despliegue: el propio `inference.py` del repositorio. Al ser una implementación personalizada y no un modelo generativo estándar, no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; la model card advierte que las APIs de carga automática requieren un adaptador explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion proporcionada. La búsqueda web asociada no devolvió resultados técnicos relevantes (únicamente páginas de YouTube), por lo que no es posible construir una comparativa con datos verificables.

Como referencia cualitativa, la familia de arquitecturas Perceiver procede del trabajo original de DeepMind y de su continuación Perceiver IO, que emplean el mismo principio de proyección sobre un conjunto latente fijo; sin embargo, no se dispone en la información proporcionada de cifras de parámetros, contexto, licencia ni disponibilidad de esas implementaciones que puedan consignarse aquí sin riesgo de inexactitud. Cualquier comparación rigurosa exigiría consultar las publicaciones originales y ejecutar los *baselines* bajo el mismo presupuesto de datos, ajuste y semillas, tal y como recomienda la propia model card.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. No ha superado ningún proceso de ajuste supervisado ni de alineación.
- No ha sido auditado en robustez, equidad ni transferencia de dominio; no se han evaluado sesgos.
- Riesgo de alucinación: no aplicable en sentido estricto, ya que no se documenta capacidad generativa; no obstante, cualquier salida del modelo carece de valor semántico al tratarse de pesos inicializados.
- Limitaciones de contexto e idioma: no disponibles; no se especifica ventana de contexto ni cobertura idiomática.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright y la cláusula de exención de responsabilidad. La model card recuerda que deben revisarse por separado los términos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Implementación personalizada: las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que añade trabajo de integración.
- Sin mantenimiento ni tracción: 0 descargas y 0 «likes» en el momento de la consulta.
- Advertencia de reproducibilidad: los valores de `training_args.json` son puntos de partida del script, no resultados de una ejecución completada. Cualquier resultado futuro debe documentarse por separado de estos valores por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yichenhuf/perceiver-demo-2024
- Búsqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes asociados a este modelo en la información proporcionada.
