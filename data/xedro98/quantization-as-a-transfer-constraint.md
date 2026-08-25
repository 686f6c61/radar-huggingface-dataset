# xedro98/quantization-as-a-transfer-constraint

## Resumen

Este repositorio no contiene un modelo de IA desplegable, sino el material completo de un estudio empírico sobre la interacción entre cuantización de baja precisión y la transferencia de hiperparámetros en el marco de maximal update parametrization (muP). El autor, Shubhankar Kahali de Trumbo Labs, Inc, investiga si la transferencia zero-shot de learning rate que muP garantiza en aritmética exacta se mantiene cuando los pesos y activaciones se cuantizan a 8 y 4 bits. El trabajo se centra en perceptrones multicapa (MLP) entrenados sobre FashionMNIST y CIFAR-10, con factores de anchura de hasta 16 veces.

La relevancia actual radica en que la cuantización es una técnica estándar para reducir memoria y acelerar inferencia en producción, pero su efecto sobre la estabilidad de muP no estaba documentado. El estudio concluye que la transferencia de learning rate sobrevive a la cuantización, pero que el margen de estabilidad de muP se colapsa cuando se cuantizan las activaciones por tensor. El repositorio incluye el preprint en PDF, el manuscrito en Markdown, todas las figuras, los scripts de entrenamiento y los datos de resultados por celda, lo que permite reproducir íntegramente los experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) con anchuras 64, 128, 512 y 1024; entrenado con muP (set_base_shapes, MuAdam, MuReadout) |
| Parametros totales | no disponible (depende de la anchura; el estudio no reporta el numero total de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision clasica, no secuencial) |
| Tipos de cuantizacion | Simulada: 8 y 4 bits; por tensor, por unidad de salida y block-scaled MX-inspired; sobre pesos, activaciones o ambos |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no aplica (no se distribuyen pesos entrenados; solo codigo, datos y paper) |

## Arquitectura y entrenamiento

El estudio utiliza MLPs de una sola capa oculta con activaciones ReLU, entrenados con el paquete oficial `mup` de Microsoft. La parametrizacion muP escala las inicializaciones y las tasas de aprendizaje por anchura para que el comportamiento del modelo sea estable al aumentar el numero de unidades. El entrenamiento se realiza con Adam (beta1=0.9, beta2=0.999, epsilon=1e-8), 1000 pasos, batch de 128, y cada configuracion se ejecuta con 3 semillas (6 para las celdas de mayor varianza). La cuantizacion se simula en lugar de usar hardware real: se redondean pesos y activaciones a 8 o 4 bits con esquemas por tensor, por unidad de salida y block-scaled inspirado en MX. El dataset principal es FashionMNIST, con una replicacion cualitativa en CIFAR-10.

La innovacion tecnica del trabajo no esta en la arquitectura del modelo, sino en el diseno experimental: se comparan sistematicamente tres esquemas de cuantizacion, dos precisiones y tres anchuras, midiendo la perdida final, la exactitud y la divergencia. Ademas, se incluye un experimento directo de transferencia zero-shot: se fija el learning rate optimo encontrado en una anchura pequena y se aplica a anchuras mayores, comparando muP con la parametrizacion estandar (SP). El diagnostico mecanistico (`run_qdist.py`) analiza la relacion update-to-grid y el error de redondeo para explicar por que la cuantizacion por tensor degrada la estabilidad.

## Capacidades

- Reproducir los experimentos completos del paper mediante los scripts en `code/` (sweeps de tasa de aprendizaje, cuantizacion por canal, rejillas refinadas, transferencia zero-shot, replicacion CIFAR-10 y diagnostico mecanistico).
- Acceder a los datos brutos de resultados por celda en `data/` (formato JSON), incluyendo perdida final, exactitud y flags de divergencia para cada combinacion de parametrizacion, configuracion de cuantizacion, anchura, learning rate y semilla.
- Consultar el manuscrito completo en Markdown (`manuscript/draft_quant.md`) y el preprint en PDF (`paper/quant_transfer_arxiv.pdf`), con las 4 figuras en `figures/`.
- Verificar la integridad de los archivos mediante `MANIFEST.json` (listado con tamanos y hashes SHA-256).
- Generar el PDF del paper a partir del manuscrito usando `build_report.py` (estilo arXiv).
- Reutilizar el codigo para extender los experimentos a otras arquitecturas, datasets o esquemas de cuantizacion, ya que los scripts estan disenados para ser modulares.

## Casos de uso

- Investigacion sobre transferencia de hiperparametros en baja precision: un investigador puede ejecutar `run_quant_seeds.py` para reproducir los sweeps base y verificar si la transferencia de learning rate se mantiene bajo cuantizacion de pesos a 4 bits en su propio entorno.
- Validacion de esquemas de cuantizacion para entrenamiento distribuido: el codigo permite comparar cuantizacion por tensor frente a por unidad de salida, lo que ayuda a decidir que esquema usar en sistemas con restricciones de memoria.
- Diseno de pipelines de entrenamiento con muP en hardware de baja precision: los resultados del paper (el margen de estabilidad colapsa con cuantizacion por tensor de activaciones) sirven como advertencia practica para quienes planean usar muP en GPUs con soporte FP8 o INT4.
- Analisis de estabilidad numerica: `run_qdist.py` proporciona un diagnostico de la relacion update-to-grid y el error de redondeo, util para entender por que ciertos esquemas de cuantizacion degradan el entrenamiento.
- Extension a otros datasets: `run_quant_cifar.py` muestra como adaptar los experimentos a CIFAR-10; un usuario puede modificar el script para ImageNet o datasets propios.
- Reproducibilidad academica: el repositorio incluye todos los datos y codigo necesarios para verificar las afirmaciones del paper, lo que lo convierte en una referencia para revisiones por pares o replicaciones independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el sentido clasico (MMLU, HumanEval, etc.) porque no se trata de un modelo de lenguaje o vision generativa. Los resultados experimentales del paper, reportados en el abstract, son:

| Configuracion | Perdida (nats) respecto a fp32 |
|---|---|
| Pesos 4-bit (por tensor) | ~0.01 (dentro de una centesima de fp32) |
| Pesos 4-bit (por unidad de salida) | ~0.05 a 0.08 |
| Pesos 4-bit (block-scaled) | ~0.05 a 0.08 |
| Pesos 4-bit (per-tensor) | 0.3 a 0.4 de degradacion |

Ademas, el margen de learning rate estable de muP se reduce de 2e-1 a entre 1e-2 y 5e-2 cuando se cuantizan las activaciones por tensor. La transferencia zero-shot bajo 4-bit no muestra perdida medible frente al oraculo por anchura, mientras que la parametrizacion estandar diverge catastroficamente. Estos datos provienen del abstract del paper; los datos brutos completos estan en `data/`.

## Requisitos de hardware

- Entorno de ejecucion: Python 3.11, PyTorch en CPU (el paper indica explicitamente "PyTorch (CPU)"), torchvision y el paquete `mup`.
- No se requiere GPU: los experimentos son de pequena escala (MLPs en FashionMNIST y CIFAR-10) y se ejecutan en CPU.
- Memoria RAM: no especificada, pero al ser MLPs pequenos y datasets clasicos, es compatible con cualquier maquina moderna (8 GB o mas).
- Almacenamiento: el repositorio pesa 0.0 GB segun HuggingFace, aunque los datos generados al ejecutar los scripts pueden ocupar algunos cientos de MB.
- Opciones de despliegue: no aplica, no es un modelo de inferencia. Para reproducir, basta con clonar el repo y ejecutar los scripts con las dependencias indicadas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de la misma categoria (no hay modelos de lenguaje, vision o generativos). Se trata de un estudio empirico sobre tecnicas de entrenamiento; no existen repositorios equivalentes en HuggingFace con los que comparar directamente.

## Limitaciones y advertencias

- El estudio se limita a MLPs de una capa oculta y a dos datasets (FashionMNIST y CIFAR-10). Los resultados pueden no generalizar a arquitecturas transformer, modelos de lenguaje o datasets de mayor escala.
- La cuantizacion es simulada, no ejecutada en hardware real de baja precision. Los efectos de la cuantizacion real (p. ej., en GPUs con soporte FP8) pueden diferir.
- El numero de pasos de entrenamiento es fijo (1000) y el batch es pequeno (128); no se exploran regimenes de entrenamiento prolongado ni lotes mayores.
- No se distribuyen pesos entrenados ni un modelo listo para inferencia; el repositorio es exclusivamente para investigacion y reproduccion.
- La licencia CC BY 4.0 permite uso comercial y modificacion, pero exige atribucion al autor original (Shubhankar Kahali, Trumbo Labs, Inc).
- El DOI de la publicacion en Zenodo/OSF aparece como "asignado en publicacion", por lo que la cita formal puede no estar disponible aun.
- No se reportan metricas de sesgo, alucinacion o seguridad, ya que no es un modelo generativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xedro98/quantization-as-a-transfer-constraint
- Paper (PDF dentro del repo): `paper/quant_transfer_arxiv.pdf`
- Manuscrito fuente: `manuscript/draft_quant.md`
- Codigo de entrenamiento: `code/` (run_quant_seeds.py, run_quant_perchannel.py, run_quant_refined.py, run_quant_extra.py, run_quant_transfer.py, run_quant_cifar.py, run_qdist.py, build_report.py)
- Datos de resultados: `data/` (grid_transfer.json, grid_cifar.json, qdist.json, entre otros)
- Contacto del autor: shubhankar@trumbo.dev
