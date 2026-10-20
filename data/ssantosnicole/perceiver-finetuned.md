# Ssantosnicole/perceiver-finetuned

## Resumen

`Ssantosnicole/perceiver-finetuned` es un prototipo de investigación basado en la arquitectura Perceiver, orientado a tareas de *matching* (emparejamiento entre dos conjuntos de entradas). Lo publica el usuario Ssantosnicole en HuggingFace bajo licencia MIT. A pesar del sufijo "finetuned" del nombre, la propia model card aclara que el repositorio contiene un **checkpoint de inicialización** válido para pruebas de humo, no un modelo entrenado ni evaluado.

El dato más relevante es su tamaño: 16.576 parámetros totales según el recuento real de `model.safetensors`. Es, por tanto, un artefacto de escala *toy* —tres o cuatro órdenes de magnitud por debajo de cualquier modelo utilizable en producción— cuyo interés es documental y metodológico: fija una configuración de arquitectura (atención *grouped query*, fusión por *cross attention*, activación ReLU, normalización RMSNorm) y una receta de experimento por defecto (optimizador LAMB con *schedule* exponencial) que sirven como punto de partida reproducible.

Su relevancia ahora no proviene del rendimiento, sino de la transparencia: el autor declara explícitamente que no reclama ninguna métrica de benchmark, que el checkpoint no ha sido entrenado y que la implementación es una base experimental. Resulta útil para validar infraestructura de entrenamiento, construir líneas base de capacidad mínima y estudiar el mecanismo de cuello de botella de latentes del Perceiver en un código autocontenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parámetros totales | 16.576 (según `model.safetensors`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la declara; depende del número de latentes y de la configuración en `config.json`, no publicada en la información disponible) |
| Tipos de cuantización | No disponible; solo se distribuyen pesos en `safetensors`. No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (no se declaran datos ni evaluación multilingüe) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (checkpoint de inicialización) + `config.json`, `training_args.json` y `main.py` |
| Escala declarada | small |
| Atención | grouped query |
| Fusión | cross attention |
| Activación | ReLU |
| Normalización | RMSNorm |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 9 / 0 |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo sigue el esquema Perceiver: un conjunto de latentes de baja cardinalidad actúa como cuello de botella y se actualiza mediante *cross attention* contra las entradas, lo que en teoría desacopla el coste computacional de la longitud de la secuencia de entrada. La configuración incluida especifica atención *grouped query* (variante que comparte cabezas clave/valor para reducir el coste de memoria del KV cache), fusión por *cross attention*, activación ReLU y normalización RMSNorm. El repositorio no publica el número de latentes, la dimensión oculta, el número de cabezas ni la profundidad; esos valores residen en `config.json`, que no se detalla en la información disponible.

No hay evidencia de entrenamiento. La model card describe `training_args.json` como una "receta por defecto" con optimizador LAMB y *schedule* exponencial, y advierte de forma explícita que son valores de arranque del script, "no evidencia de una ejecución completada". No se declaran tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del uso estándar de latentes del Perceiver.

Un detalle operativo importante: al ser una implementación propia (un único `main.py`), las APIs genéricas de carga automática de `transformers` requieren un adaptador explícito antes de poder instanciar el modelo. El punto de entrada previsto es `python main.py --help`, y el bloque `__main__` del script contiene el ejemplo de prueba de humo.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint es de inicialización y no ha sido entrenado, por lo que no produce emparejamientos con sentido.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara vocabulario ni corpus.
- Modalidad: el diseño Perceiver es teóricamente agnóstico al tipo de entrada (texto, imagen, audio), pero el repositorio no documenta ninguna modalidad concreta.
- Capacidad real disponible: servir como implementación de referencia ejecutable de un Perceiver con fusión por *cross attention*, cargable desde `safetensors` para pruebas de integración.
- Punto de entrada ejecutable (`main.py`) con ejemplo de *smoke test* incluido.

## Casos de uso

- **Prueba de humo de pipelines de entrenamiento**: con 16.576 parámetros, un *forward* y un *backward* se ejecutan en CPU en milisegundos. Sirve para validar *dataloaders*, guardado y reanudación de checkpoints, registro de métricas y versionado de entornos antes de escalar a un modelo real, sin gastar GPU.
- **Línea base de capacidad mínima en experimentos de matching**: al comparar un modelo entrenado contra este artefacto bajo el mismo presupuesto de datos y semillas, se cuantifica cuánta ganancia aporta realmente el entrenamiento frente a una inicialización aleatoria de arquitectura comparable.
- **Andamiaje para investigar fusión por *cross attention***: el repositorio separa modelo (`main.py`), arquitectura (`config.json`) y receta (`training_args.json`), lo que permite iterar sobre el optimizador (LAMB), el *schedule* exponencial y el número de latentes de forma aislada y reproducible.
- **Docencia y reproducción académica**: al ser una implementación autocontenida en un solo archivo Python, es adecuada para explicar el mecanismo de cuello de botella de latentes y la atención *grouped query* sin la capa de abstracción de un framework de alto nivel.
- **Test de integración de sistemas de carga de pesos**: los ~65 KB de pesos en fp32 permiten verificar rutas de carga de `safetensors`, adaptadores personalizados y políticas de versionado en un pipeline de MLOps con un coste de almacenamiento despreciable.
- **Plantilla de protocolo de evaluación**: la model card propone un protocolo concreto —conjunto de validación emparejado, métrica de la tarea promediada sobre al menos tres semillas y una línea base de capacidad equivalente— que puede reutilizarse tal cual en proyectos de *matching* reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara literalmente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint "no se presenta como un checkpoint entrenado y evaluado". Cualquier cifra que se atribuya a este modelo debe considerarse no verificada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB. Los pesos ocupan aproximadamente 65 KB en fp32 (16.576 × 4 bytes) y unos 33 KB en fp16. El consumo real lo domina el *runtime* de PyTorch (cientos de MB), no el modelo.
- **GPU recomendadas**: ninguna en particular; A100 o H100 son totalmente innecesarias. Cualquier GPU con más de 1 GB de memoria es suficiente.
- **¿Cabe en GPU de consumo?**: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090) e incluso en iGPU. La CPU es una opción perfectamente válida para el *smoke test*.
- **Opciones de despliegue**: no hay soporte para vLLM, TGI, Ollama, llama.cpp ni ningún servidor de inferencia estándar, porque no se distribuyen pesos en GGUF ni existe un `AutoModel` compatible. El despliegue previsto es la ejecución directa del script (`python main.py --help`) o la integración manual mediante un adaptador.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tarea declarada | Parámetros | Contexto | Licencia | Estado del checkpoint |
|---|---|---|---|---|---|
| `Ssantosnicole/perceiver-finetuned` | Matching | 16.576 | No disponible | MIT | Inicialización, sin entrenar |
| `Kflores66/perceiver-finetuned` | Classification | No disponible | No disponible | Apache-2.0 | No declarado en la información disponible |
| `emilysmithge/perceiver-finetuned` | Contrastive | No disponible | No disponible | BSD-3-Clause | No declarado en la información disponible |

Los tres repositorios comparten la misma plantilla de model card y la misma arquitectura Perceiver, con distinta tarea objetivo y distinta licencia; son los comparables más cercanos encontrados. No se dispone de datos de rendimiento de ninguno de ellos que permitan una comparación cuantitativa. Frente a un transformer encoder estándar para *matching*, la diferencia relevante es el uso de latentes, que desacopla el coste de la longitud de entrada, pero no hay cifras publicadas que lo respalden en este repositorio.

## Limitaciones y advertencias

- **El nombre induce a error**: "finetuned" sugiere un ajuste fino que no existe. El propio autor indica que el checkpoint es una inicialización para pruebas de humo.
- **No ha sido entrenado**: cualquier salida es equivalente a ruido; no debe usarse para inferencia real ni citarse como resultado de *matching*.
- **No auditado**: no hay evaluación de robustez, equidad ni transferencia de dominio.
- **Sin datos de entrenamiento declarados**: no se especifican tokens, composición del corpus, idiomas ni proceso de anotación, lo que impide evaluar sesgos.
- **Riesgo de alucinación**: no aplica en el sentido de un modelo generativo de lenguaje (16.576 parámetros no producen texto coherente); el riesgo real es de mala atribución, es decir, que se cite este repositorio como evidencia de un modelo funcional.
- **Licencia**: MIT permite uso comercial y modificación, pero la model card advierte de que deben revisarse por separado los términos de los datos de origen si se entrena con datasets externos.
- **Integración**: no es cargable con `AutoModel` sin un adaptador explícito; no hay pesos cuantizados ni formato GGUF, lo que descarta su uso en *runtimes* de inferencia habituales.
- **Escala**: con 16.576 parámetros la capacidad de representación es mínima; no es un sustituto de un modelo de *matching* real aunque la arquitectura sea la correcta.
- **Adopción prácticamente nula**: 9 descargas y 0 likes en la fecha consultada, sin comunidad ni issues asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ssantosnicole/perceiver-finetuned
- Repositorio hermano (Classification, Apache-2.0): https://huggingface.co/Kflores66/perceiver-finetuned
- Repositorio hermano (Contrastive, BSD-3-Clause): https://huggingface.co/emilysmithge/perceiver-finetuned
- Tema de GitHub sobre modelos ajustados (no específico de este modelo): https://github.com/topics/finetuned-model
