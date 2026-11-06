# stratosphere/qwen3.5-0.8b-slips-immune-risk

## Resumen

Qwen3.5-0.8B Slips Immune Risk es un ajuste fino del modelo Qwen3.5-0.8B de Alibaba, desarrollado por Stratosphere (grupo de investigación de la Universidad Checa de Ciencias) para el análisis automatizado de incidentes de seguridad de red detectados por Slips IDS. El modelo aborda dos tareas complementarias sobre los registros DAG que genera Slips: análisis de causa (determinar si un incidente se debe a actividad maliciosa, configuración incorrecta o comportamiento legítimo, con hipótesis alternativas) y evaluación de riesgo (nivel de riesgo calibrado, impacto de negocio, probabilidad de actividad maliciosa y prioridad de investigación).

La relevancia de este modelo reside en su enfoque de despliegue en el borde: con 873 millones de parámetros y cuantizaciones GGUF de 529 MB (Q4_K_M), puede ejecutarse en una Raspberry Pi 5 a unos 70 segundos por incidente para ambas tareas. Según la model card, bajo evaluación LLM-as-judge obtiene puntuaciones comparables al modelo de 1,5B de la misma familia y a GPT-4o, lo que lo convierte en una opción viable para despliegues con recursos muy limitados.

El modelo se entrenó mediante SFT con un único adaptador LoRA sobre un dataset combinado de causa y riesgo, seleccionando la mejor respuesta entre GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B mediante best-of-N con juez LLM. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con codificador de visión no entrenado conservado del modelo base |
| Parametros totales | 873.438.784 (aproximadamente 0,87B; el modelo de lenguaje es de ~0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only con un codificador de visión que en este checkpoint permanece sin entrenar y se conserva únicamente para que el modelo cargue como un checkpoint estándar de Qwen3.5. `AutoModelForCausalLM` carga solo el modelo de lenguaje de ~0,75B parámetros, y los archivos GGUF contienen exclusivamente el modelo de lenguaje. El ajuste fino se realizó con SFT mediante un único adaptador LoRA que cubre ambas tareas (causa y riesgo), usando TRL y Unsloth.

El dataset de entrenamiento (`stratosphere/immune-risk-sft-dataset`) se construyó con selección best-of-N: para cada incidente de entrenamiento se generaron respuestas con GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B, y se eligió como verdad de referencia la mejor puntuada por un juez LLM. El modelo usa dos formatos de prompt distintos (uno para análisis de causa y otro para evaluación de riesgo) aplicados al mismo DAG de incidente, y la plantilla de chat inserta automáticamente el system prompt por defecto de Qwen. No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Análisis de causa de incidentes: clasifica la causa probable como actividad maliciosa, actividad legítima o configuración incorrecta, con hipótesis alternativas y una conclusión con recomendación de investigación.
- Evaluación de riesgo: genera nivel de riesgo calibrado, declaración de impacto de negocio, probabilidad de actividad maliciosa y prioridad de investigación.
- Procesamiento de registros DAG de Slips IDS: interpreta cadenas de eventos de seguridad relacionados por IP de origen y ventana temporal.
- Razonamiento estructurado: produce salidas con formato fijo (posibles causas, conclusión) según las instrucciones del prompt.
- Generación de texto conversacional en inglés.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la estructura de análisis solicitada.
- Capacidad multilingüe limitada al inglés según la model card.
- El codificador de visión está presente pero no entrenado; no se documentan capacidades de visión efectivas.

## Casos de uso

- Triaje automatizado de alertas en SOC: el modelo recibe el DAG de un incidente generado por Slips y devuelve causa probable y prioridad de investigación, permitiendo a los analistas ordenar la cola de alertas por urgencia sin revisar manualmente cada registro.
- Despliegue en dispositivos de borde: con la cuantización Q4_K_M (529 MB) puede ejecutarse en una Raspberry Pi 5 junto al propio IDS, lo que permite análisis local de incidentes en redes sin conexión a la nube ni GPUs dedicadas.
- Reducción de falsos positivos: al distinguir entre actividad maliciosa, legítima y configuraciones incorrectas, el modelo ayuda a descartar alertas benignas antes de escalarlas a un analista humano.
- Enriquecimiento de informes de incidentes: la salida estructurada (posibles causas, conclusión, impacto de negocio) puede incorporarse directamente a tickets o informes de investigación, reduciendo el trabajo de redacción del analista.
- Monitorización de redes domésticas o de pequeñas oficinas: el modelo puede integrarse en un despliegue de Slips de bajo coste para explicar en lenguaje natural por qué se ha disparado una alerta y qué gravedad tiene.
- Formación y simulación: las hipótesis alternativas que genera el modelo sirven como material didáctico para analistas noveles que aprenden a razonar sobre cadenas de eventos de seguridad.
- Análisis por lotes de incidentes históricos: al procesar cada incidente en aproximadamente 70 segundos en CPU, puede ejecutarse de forma desatendida sobre registros acumulados para clasificar y priorizar incidentes pasados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que, bajo la misma evaluación LLM-as-judge, el modelo obtiene puntuaciones comparables al modelo `stratosphere/qwen2.5-1.5b-slips-immune-risk` y a GPT-4o, y que la cuantización Q8_0 obtiene la mejor puntuación de juez de las tres cuantizaciones GGUF, pero no se proporcionan las cifras concretas.

| Metrica | Resultado |
|---|---|
| Evaluacion LLM-as-judge vs. Qwen2.5 1.5B (misma familia) | Comparable (sin cifras publicadas) |
| Evaluacion LLM-as-judge vs. GPT-4o | Comparable (sin cifras publicadas) |
| Latencia en Raspberry Pi 5 (ambas tareas por incidente) | ~70 segundos |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7-2 GB para los pesos (873M parámetros), más overhead de activaciones y contexto.
- VRAM estimada con GGUF Q4_K_M: alrededor de 0,5-1 GB; con Q5_K_M, alrededor de 0,6-1,1 GB; con Q8_0, alrededor de 0,8-1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede ejecutar el modelo con holgura; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM según cuantización; también en dispositivos como Raspberry Pi 5 en modo CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, recomendado para local y borde), Transformers con `AutoModelForCausalLM` (requiere una versión reciente con soporte de Qwen3.5, probada con 5.17). No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: aproximadamente 70 segundos por incidente (ambas tareas) en Raspberry Pi 5 con CPU. No se proporcionan cifras para GPU.
- Nota de despliegue: en dispositivos solo CPU como la Raspberry Pi 5 debe mantenerse flash attention desactivado (`-fa off`), ya que con `-fa auto` llama.cpp lo activa y ralentiza la generación con prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stratosphere/qwen3.5-0.8b-slips-immune-risk | ~0,87B | No disponible | Analisis de causa y riesgo de incidentes Slips | Apache 2.0 | Hugging Face |
| stratosphere/qwen2.5-1.5b-slips-immune-risk | ~1,5B | No disponible | Misma tarea, mismos datos y prompts | No disponible en la informacion | Hugging Face |
| Qwen3.5-0.8B (modelo base) | ~0,87B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face |
| GPT-4o | No disponible | No disponible | Modelo generalista propietario | Propietaria | API |

El modelo de 0,8B se posiciona como la variante para dispositivos pequeños de la familia: comparte datos de entrenamiento, prompts e hiperparámetros con el modelo de 1,5B, con aproximadamente la mitad de tamaño y puntuaciones de juez comparables según la model card.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el análisis de incidentes de Slips IDS; su uso fuera de ese dominio no está validado y probablemente produzca resultados pobres.
- Idioma limitado al inglés: no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje: las hipótesis de causa y las evaluaciones de riesgo pueden ser plausibles pero incorrectas, por lo que requieren validación humana antes de acciones críticas.
- El codificador de visión está sin entrenar; no debe asumirse ninguna capacidad de visión efectiva.
- El modelo se entrenó con respuestas seleccionadas de otros modelos (GPT-4o, GPT-4o-mini, Qwen2.5 3B y 1.5B) mediante juez LLM, lo que puede heredar sesgos y errores de esos modelos y del juez utilizado.
- No se documentan evaluaciones de sesgo ni de robustez frente a entradas adversariales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar.
- El rendimiento en producción depende de la calidad del DAG de entrada generado por Slips; registros incompletos o mal formados degradarán el análisis.
- La latencia de ~70 segundos por incidente en Raspberry Pi 5 limita su uso a análisis asíncrono o por lotes, no a respuesta en tiempo real.
- No se documentan resultados de benchmarks numéricos reproducibles, solo comparaciones cualitativas mediante juez LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stratosphere/qwen3.5-0.8b-slips-immune-risk
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo hermano de 1,5B: https://huggingface.co/stratosphere/qwen2.5-1.5b-slips-immune-risk
- Dataset de entrenamiento: https://huggingface.co/datasets/stratosphere/immune-risk-sft-dataset
- Repositorio de Slips IDS: https://github.com/stratosphereips/StratosphereLinuxIPS
