# t4tarzan/DKube-instruct

## Resumen

DKube-instruct es un adaptador LoRA desarrollado por t4tarzan sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Está especializado en el troubleshooting de operaciones Kubernetes (K8s): diagnóstico y corrección de errores, preguntas de tipo "error → fix" y sugerencias de comandos kubectl o manifiestos YAML. Se trata de un prototipo experimental, entrenado en Apple Silicon MPS con fp16 (sin QLoRA), con un presupuesto de entrenamiento muy limitado (decenas a cientos de pasos). El adaptador tiene un tamaño de 0.2 GB y está pensado para uso local en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5) + adaptador LoRA |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA (parametros no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (entrenamiento y carga del adaptador); no se mencionan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Other (adaptador); el modelo base Qwen2.5-0.5B-Instruct sigue la licencia de Qwen |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-0.5B-Instruct, un modelo de lenguaje de 0.5B de parámetros. El entrenamiento se realizó mediante LoRA (Low-Rank Adaptation) en precisión fp16 sobre Apple Silicon (MPS), sin QLoRA ni bitsandbytes. Los datos de entrenamiento provienen de una mezcla de fuentes: AnveshGummala/k8s-troubleshooting-customdsv3 (con licencia no declarada, ~97 filas en formato ChatML), jalpan04/devops-sft-dataset (Apache-2.0, filtrado a filas de K8s/kubectl/troubleshooting/YAML), Scoutflo/Scoutflo-SRE-Playbooks (MIT, convertido a pares instrucción-respuesta), documentación oficial del sitio web de Kubernetes y kubectl quick-ref (CC BY 4.0), y spacezenmasterr/k8s-sft-cmd-en (MIT, secuencias kubectl multi-paso). No se utilizaron los datasets yifeichen/k8s-troubleshooting-data ni SingulioDev/varxipod-k8s-remediation. No se aplicó RLHF ni DPO. El entrenamiento fue de tipo prototipo, con un presupuesto muy corto.

## Capacidades

- Generación de respuestas de diagnóstico para problemas de Kubernetes: el adaptador puede sugerir causas y remediaciones a partir de descripciones de errores.
- Preguntas y respuestas de tipo "error → fix": por ejemplo, ante un CrashLoopBackOff, proporciona pasos de verificación y soluciones.
- Sugerencia de comandos kubectl: genera comandos útiles para inspeccionar logs, recursos, eventos, etc.
- Sugerencia de manifiestos YAML: propone correcciones o mejoras en definiciones de recursos Kubernetes.
- Capacidades multilingües: limitadas al inglés.
- No se especifica soporte de tool calling ni de agentes en la documentación del adaptador; el modelo base Qwen2.5-0.5B-Instruct puede soportar estas funciones, pero el adaptador no está entrenado específicamente para ello.

## Casos de uso

- Asistente local para diagnóstico de fallos en clústeres: un ingeniero de plataforma puede consultar el modelo en su entorno local para obtener una primera lista de posibles causas y acciones para un error de Kubernetes. Es adecuado por su tamaño reducido (0.5B) y su entrenamiento específico en datos de troubleshooting.
- Generación de comandos kubectl en laboratorios: el modelo puede sugerir secuencias de comandos para inspeccionar pods, servicios o logs, basándose en playbooks de SRE. Sirve como referencia rápida en entornos de prueba.
- Revisión de manifiestos YAML en preproducción: ante un recurso con problemas (por ejemplo, readinessProbe mal configurada), el adaptador puede proponer ajustes en el YAML, aunque debe verificarse manualmente.
- Material de entrenamiento para equipos de plataforma: el modelo puede utilizarse para generar preguntas y respuestas de ejemplo sobre incidentes comunes, como apoyo a la formación interna.
- Integración en entornos de desarrollo con Apple Silicon: gracias a su entrenamiento en MPS, el adaptador se puede cargar fácilmente en portátiles Mac para consultas offline sin depender de servicios externos.
- Documentación interactiva de Kubernetes: el modelo puede responder preguntas basadas en la documentación oficial de Kubernetes (CC BY 4.0), proporcionando referencias, aunque no es un sistema RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Al ser un modelo base de 0.5B en fp16, los pesos ocupan aproximadamente 1 GB; sumando el adaptador LoRA y la caché KV, una GPU con 2-4 GB de VRAM es suficiente para inferencia básica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o Apple Silicon (MPS) puede ejecutar el modelo. También es viable en CPU.
- Compatibilidad con GPU consumer: sí, es un modelo muy pequeño que cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: el adaptador se carga con `transformers` y `peft` (según la model card). No se menciona soporte oficial para vLLM, llama.cpp, Ollama o TGI. Para usarlo en estos entornos sería necesario fusionar el adaptador con el modelo base y convertirlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación del adaptador. Se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | No disponible en la información | Licencia Qwen | HuggingFace |
| DKube-instruct (adaptador) | 0.5B + LoRA | No disponible | Other | HuggingFace |

El adaptador añade conocimiento específico de Kubernetes, pero sigue siendo un prototipo con calidad de prueba de humo.

## Limitaciones y advertencias

- El dataset AnveshGummala/k8s-troubleshooting-customdsv3 tiene una licencia no declarada; esa parte no debe redistribuirse sin aclarar los términos.
- El entrenamiento fue un prototipo con presupuesto muy corto (decenas a cientos de pasos); la calidad es de nivel "smoke-test", no apta para producción.
- Las respuestas generadas pueden estar incompletas o ser sintéticas; es obligatorio verificar antes de aplicar cambios en clústeres reales.
- No es un agente SRE de producción; no realiza ejecución en clústeres ni integración con RAG.
- No se aplicó RLHF ni DPO, por lo que el comportamiento puede ser menos alineado con preferencias humanas que otros modelos.
- Solo soporta inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en dominios técnicos.

## Enlaces

- HuggingFace: https://huggingface.co/t4tarzan/DKube-instruct
- GitHub del autor: https://github.com/t4tarzan
- Repositorio Scoutflo-SRE-Playbooks: https://github.com/Scoutflo/Scoutflo-SRE-Playbooks
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
