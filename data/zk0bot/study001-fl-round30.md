# zk0bot/study001-fl-round30

## Resumen

`zk0bot/study001-fl-round30` es un artefacto de investigacion, no un modelo listo para produccion. Se trata del checkpoint final (ronda 30) del brazo federado del "Study 001" del proyecto zk0, un experimento de aprendizaje federado construido sobre el modelo base `lerobot/smolvla_base`, que es un modelo de vision-lenguaje-accion (VLA) orientado a control robótico dentro del ecosistema LeRobot. El autor lo publica explicitamente como copia de seguridad de checkpoint ("checkpoint backup") y advierte que no es el modelo zk0 distribuido, que reside en `ivelin/zk0-smolvla-fl` y no se ve afectado por este repositorio.

El checkpoint tiene 450.046.176 parametros (~450 M) en formato safetensors, con un fichero `model.safetensors` de 1.197.789.224 bytes (~1,2 GB) y un repositorio total de 1,3 GB. El entrenamiento consistio en 30 rondas de aprendizaje federado con 5 clientes y 100 pasos por cliente y ronda, usando FedProx con mu=0.1 fijo y sustrato Flower serializado, con el preprocesador D-9 empaquetado (hash de estadisticas `a0455b5b...`). Las perdidas finales de cliente quedaron entre 0.176 y 0.422, con mediana 0.222.

Su relevancia es acotada y de caracter metodologico: sirve como evidencia reproducible de un pipeline de entrenamiento federado sobre un VLA pequeno, no como modelo para desplegar. La evaluacion esta pendiente y el autor no reclama ninguna capacidad concreta para este artefacto, por lo que cualquier uso en produccion debe considerarse no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) derivada de `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero `model.safetensors`, 1.197.789.224 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA pequeno del ecosistema LeRobot (libreria declarada: `lerobot`). No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimension oculta, mecanismo de atencion ni el encoder visual empleado. El checkpoint resultante conserva la estructura del modelo base y anade los pesos ajustados durante el estudio federado.

El entrenamiento se realizo en el marco del "Study 001" (BENCH-003, brazo federado, D-11): 30 rondas, 5 clientes por ronda y 100 pasos por cliente y ronda, con agregacion FedProx y coeficiente de proximidad mu=0.1 fijo, sobre un sustrato Flower serializado. Se empaqueto el preprocesador D-9 agrupado (hash de estadisticas `a0455b5b...`). Las perdidas finales por cliente se situaron entre 0.176 y 0.422, con mediana 0.222. No consta en la informacion disponible el volumen total de tokens o muestras, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El checkpoint se genero en una DGX Spark en la ruta local `/home/openclaw/muse-work/zk0-study001-fl-20261121/outputs/2026-11-21_14-56-47/models/checkpoint_round_30` y se respaldo el 2026-11-22 con el hash SHA-256 `5b1cbf290b8b4beeeb9a77473f0d03c0e3ffce8c038b7aab56bc6795fc7a84b4` (calculado en local antes de la subida).

## Capacidades

- Al ser un artefacto derivado de un VLA, la capacidad esperada es la de un modelo vision-lenguaje-accion para control robótico, pero el autor no reclama ninguna capacidad para este checkpoint concreto.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible; no se documenta ninguna de estas capacidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La unica indicacion es la herencia de la familia SmolVLA, orientada a percepcion visual y accion.

## Casos de uso

- Reproducibilidad de investigacion federada: el checkpoint permite inspeccionar el estado final de la ronda 30 de un experimento FedProx sobre un VLA, util para comparar curvas de perdida y validar el pipeline Flower frente a ejecuciones futuras.
- Auditoria de agregacion FedProx: con las perdidas por cliente documentadas (0.176-0.422), se puede analizar la dispersion entre clientes y evaluar el efecto de mu=0.1 fijo en la convergencia.
- Punto de partida para evaluacion pendiente: el autor indica que la evaluacion esta pendiente, de modo que este checkpoint sirve como base para ejecutar los benchmarks que se definan en el estudio.
- Reanudacion de entrenamiento: al conservar el preprocesador D-9 empaquetado y el estado del modelo base, permite continuar rondas adicionales o cambiar la estrategia de agregacion.
- Verificacion de integridad de artefactos: el hash SHA-256 y el tamano exacto del fichero permiten comprobar la integridad de la copia de seguridad en pipelines de MLOps.
- Docencia y formacion en aprendizaje federado: como ejemplo real de checkpoint intermedio de un estudio federado con sustrato Flower sobre un modelo VLA pequeno (~450 M), adecuado para material didactico sobre particionado de datos y agregacion de pesos.
- No se recomienda su uso como modelo de produccion: el propio autor lo desmarca del modelo distribuido (`ivelin/zk0-smolvla-fl`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que la evaluacion esta pendiente y que este artefacto no formula ninguna afirmacion de capacidad. Los unicos datos numericos publicados son las perdidas finales de cliente del entrenamiento federado (rango 0.176-0.422, mediana 0.222), que no constituyen una evaluacion de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp32): aproximadamente 1,8 GB solo para pesos (450 M parametros x 4 bytes), mas activaciones y estado del runtime; en la practica, el fichero safetensors ocupa 1,2 GB.
- En fp16/bf16: alrededor de 0,9 GB para pesos, mas overhead de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM o mas deberia poder alojar los pesos, pero no hay datos de compatibilidad ni de rendimiento verificados.
- Cabe en GPU consumer: previsiblemente si, dado el tamano (~450 M), aunque no se documenta ninguna GPU concreta probada.
- Opciones de despliegue: la libreria declarada es `lerobot`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `zk0bot/study001-fl-round30` | 450.046.176 | no disponible | Apache 2.0 | Checkpoint de investigacion, sin evaluacion |
| `lerobot/smolvla_base` | no disponible | no disponible | no disponible | Modelo base de partida del estudio |
| `ivelin/zk0-smolvla-fl` | no disponible | no disponible | no disponible | Modelo zk0 distribuido, segun el autor |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a la relacion de linaje y al estado de publicacion.

## Limitaciones y advertencias

- No es el modelo distribuido: el autor advierte que se trata de una copia de seguridad de checkpoint y que el modelo zk0 publicado es `ivelin/zk0-smolvla-fl`, que este repositorio no modifica.
- Sin evaluacion: la evaluacion esta pendiente y no se formula ninguna afirmacion de capacidad; no hay benchmarks que respalden su uso.
- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo.
- Riesgo de alucinacion: no evaluado; al ser un artefacto sin validacion, no puede descartarse.
- Limitaciones de contexto o idioma: no disponibles; no se documentan idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso; no obstante, la falta de evaluacion desaconseja su uso en produccion.
- Caveat para produccion: el checkpoint incluye el preprocesador D-9 empaquetado con un hash de estadisticas concreto (`a0455b5b...`); cualquier despliegue debe respetar ese preprocesamiento para mantener la coherencia de las entradas.
- Integridad: conviene verificar el SHA-256 del fichero (`5b1cbf290b8b4beeeb9a77473f0d03c0e3ffce8c038b7aab56bc6795fc7a84b4`) antes de reutilizarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zk0bot/study001-fl-round30
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo zk0 distribuido (referenciado por el autor): https://huggingface.co/ivelin/zk0-smolvla-fl
- Libreria LeRobot: no disponible en la informacion proporcionada
- Paper, blog o demo del estudio: no disponible en la informacion proporcionada
