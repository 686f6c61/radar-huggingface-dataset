# suryatmodulus/Alpamayo2-Edge

## Resumen

Alpamayo 2 Edge es un modelo visión-lenguaje-acción (VLA) de 2.650 millones de parámetros desarrollado por NVIDIA dentro de su plataforma abierta Alpamayo para conducción autónoma. El modelo combina un backbone VLM de tipo Nemotron (heredado de Cosmos 3 Edge) con un decodificador de acciones basado en difusión, y su objetivo es generar trayectorias de conducción condicionadas por instrucciones de navegación, junto con explicaciones causales en lenguaje natural sobre las decisiones tomadas.

La propuesta diferencial es el razonamiento adaptativo: el modelo emite una cadena de razonamiento ("Chain-of-Causation") que justifica cada maniobra antes de producir la trayectoria, lo que facilita la auditabilidad en sistemas de planificación para vehículos autónomos. Está diseñado para despliegue eficiente en plataformas embebidas del vehículo, concretamente en NVIDIA DRIVE AGX Thor, y se distribuye como punto de partida para fine-tuning por parte de desarrolladores e investigadores.

El modelo se publica bajo licencia OpenMDW-1.1 (pesos) con código Apache 2.0, admite entradas multimodales (seis cámaras, historial de egomoción e instrucciones de texto) y produce salidas estructuradas de 64 waypoints a 0,1 s de resolución sobre un horizonte de 6,4 s. Su contexto multimodal es amplio (22 fotogramas por observación en predicción de trayectoria), aunque el idioma soportado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA: backbone VLM (Nemotron, Cosmos 3 Edge) + decodificador de acciones por difusion |
| Parametros totales | 2.651.163.378 (2,65 B) |
| Parametros activos | No aplica (no es MoE) |
| Desglose de parametros | Backbone 2,45 B (1,96 B LM + 0,41 B SigLIP2 + 0,08 B proyector); Action Expert 0,2 B |
| Longitud de contexto | No disponible (ventana multimodal: 22 fotogramas por observacion en trayectoria, 4 por camara en VQA) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (pesos); codigo Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repo | 5,3 GB |
| Pipeline | robotics |
| Modelo base | nvidia/Cosmos3-Edge |

## Arquitectura y entrenamiento

La arquitectura es un transformer VLA compuesto por dos bloques diferenciados. El backbone VLM, derivado de Cosmos 3 Edge y con base Nemotron, integra un encoder visual SigLIP2 de 0,41 B de parámetros, un proyector de 0,08 B y un modelo de lenguaje de 1,96 B. Sobre este backbone se acopla un Action Expert de 0,2 B que implementa un decodificador de acciones basado en difusión: predice aceleración y curvatura por paso, que un modelo de bicicleta (unicycle model) integra en un espacio de acción curso-heading para producir posiciones XYZ y matrices de rotación 3x3 en el marco del ego.

La entrada de trayectoria utiliza seis cámaras con 22 fotogramas por observación (cinco para las cámaras frontales wide y tele en −2, −1, −0,5, −0,1 y 0 s; tres para las cámaras cruzadas y traseras en −1, −0,1 y 0 s), junto con una instrucción de navegación en texto y 20 poses históricas del ego a pasos de 0,1 s desde −1,9 hasta 0 s. El prompt de conducción termina con un bloque `<think></think>` vacío tras el cual el modelo escribe su razonamiento; la plantilla de chat debe aplicarse con `enable_thinking=False`. El entrenamiento se realizó sobre los datasets `nvidia/PhysicalAI-Autonomous-Vehicles` y `nvidia/PhysicalAI-Autonomous-Vehicles-NuRec`, aunque no se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de trayectorias de conducción condicionadas por instrucciones de navegación: 64 waypoints de 0,1 a 6,4 s con posiciones XYZ y matrices de rotación 3x3.
- Razonamiento causal explícito ("Chain-of-Causation"): cada trayectoria candidata incluye su propio texto de razonamiento muestreado de forma independiente.
- Respuesta a preguntas libres sobre la escena de conducción (VQA) usando las mismas seis cámaras con cuatro fotogramas por cámara.
- Procesamiento multimodal conjunto de imagen RGB multicámara, texto e historial de egomoción (traslación 3D y rotación 9D).
- Razonamiento adaptativo: el modelo decide cuánto razonar antes de emitir la acción.
- Soporte de fine-tuning sobre el checkpoint base para adaptación a dominios o flotas específicas.
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes en la información disponible.

## Casos de uso

- Planificación de trayectorias en vehículos autónomos: el modelo integra seis cámaras, instrucciones de navegación y 20 poses históricas para generar una trayectoria de 6,4 s a 10 Hz, adecuada para bucles de control en tiempo real sobre DRIVE AGX Thor.
- Auditoría y explicabilidad de decisiones: la cadena de razonamiento causal asociada a cada trayectoria permite registrar por qué el sistema eligió una maniobra, útil para depuración, certificación y análisis post-incidente.
- Fine-tuning por flotas o fabricantes: al ser un checkpoint compacto de 2,65 B con licencia OpenMDW-1.1, un equipo puede adaptarlo a la geometría de su vehículo, su conjunto de cámaras o sus políticas de conducción.
- Asistencia a la conducción con explicación al conductor: el modelo puede responder preguntas en lenguaje natural sobre la escena ("¿por qué frenamos?") usando el mismo conjunto de cámaras.
- Investigación en VLA para robótica y conducción: sirve como banco de pruebas para estudiar decodificadores de acción por difusión acoplados a backbones VLM.
- Etiquetado y generación de datos sintéticos de conducción: las trayectorias y explicaciones generadas pueden emplearse para aumentar datasets de entrenamiento o validar políticas existentes.
- Evaluación de sistemas de percepción-planificación end-to-end: al desacoplar backbone y Action Expert, permite analizar por separado errores de percepción y de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5,3 GB solo para pesos, más overhead de activaciones y del codificador visual multicámara (22 fotogramas distribuidos en seis cámaras); se recomienda un mínimo de 16 GB para margen operativo.
- GPU validadas oficialmente: NVIDIA H100 80GB HBM3 (única arquitectura probada según la model card).
- Despliegue objetivo en vehículo: NVIDIA DRIVE AGX Thor.
- No se confirma compatibilidad con GPUs de consumo; otras arquitecturas no han sido validadas por el autor.
- Opciones de despliegue: PyTorch 2.8.0 con Transformers 5.17.0, SDPA por defecto y FlashAttention 2.8.3 opcional (requerido para inferencia acelerada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12, Linux, torchvision 0.23.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpamayo 2 Edge | 2,65 B (2,45 B backbone + 0,2 B action) | No disponible | VLA con decodificador de difusion y razonamiento causal | OpenMDW-1.1 | Hugging Face + GitHub NVlabs |
| nvidia/Cosmos3-Edge | No disponible en la informacion | No disponible | VLM backbone base | No disponible en la informacion | Hugging Face (NVIDIA) |
| Alternativas VLA de conduccion de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; las instrucciones de navegación y las preguntas deben formularse en ese idioma.
- Validación de hardware limitada: solo se ha probado en H100 80GB; el resto de arquitecturas GPU no están validadas, lo que introduce riesgo en despliegues alternativos.
- Riesgo de alucinación en el texto de razonamiento: la cadena causal es generada por el modelo y no constituye una garantía de corrección de la maniobra; debe tratarse como explicación plausible, no como certificación.
- Dependencia de calibración de cámaras y timestamps: la entrada exige marcas temporales de captura y una configuración concreta de seis cámaras; variaciones en la geometría o en la frecuencia de captura pueden degradar el rendimiento.
- Restricciones de licencia: los pesos usan OpenMDW-1.1, cuyos términos deben revisarse antes de uso comercial; el código es Apache 2.0, pero la licencia de pesos es distinta.
- Requiere aplicar la plantilla de chat con `enable_thinking=False`; un uso incorrecto de la plantilla altera el formato de salida esperado.
- El modelo está pensado como punto de partida para fine-tuning; NVIDIA advierte explícitamente de que la integración en sistemas de producción requiere validación adicional con datos específicos del caso de uso siguiendo la metodología V-model.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/suryatmodulus/Alpamayo2-Edge
- Repositorio de código: https://github.com/NVlabs/alpamayo2-edge
- Plataforma Alpamayo (NVIDIA): https://www.nvidia.com/en-us/solutions/autonomous-vehicles/alpamayo/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Dataset: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Dataset NuRec: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles-NuRec
