# SoulInPsyAbstract/specialist-vuln-05_supply_chain-salience27b-lora

## Resumen

El modelo `specialist-vuln-05_supply_chain-salience27b-lora` es un adaptador LoRA desarrollado por el usuario SoulInPsyAbstract, especializado en la detección de vulnerabilidades en la cadena de suministro de software. Se basa en el modelo `vectionlabs/Salience-27B-R5`, un modelo de 27.000 millones de parámetros del que no se dispone de información técnica detallada en los metadatos proporcionados. El adaptador se distribuye en formato PEFT (LoRA) y se ha entrenado mediante supervisión fina (SFT) con la librería TRL de Hugging Face.

La relevancia de este modelo radica en su enfoque de seguridad: la cadena de suministro de IA es un vector de ataque crítico, tal y como demuestran incidentes recientes como el ataque a LiteLLM que expuso a más de 2.500 empresas y 434.000 pipelines CI/CD. El autor tiene una serie de modelos especializados en vulnerabilidades (vuln-gate, supply-chain) que sugiere una línea de investigación en seguridad de IA aplicada. Sin embargo, la model card está completamente vacía, sin información sobre entrenamiento, datos, evaluación ni licencia, lo que limita seriamente su uso en producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `vectionlabs/Salience-27B-R5` (arquitectura del modelo base no disponible) |
| Parámetros totales | No disponible (el adaptador pesa 0.2 GB; el modelo base se estima en ~27B por su nombre) |
| Parámetros activos | No disponible (el adaptador LoRA activa un subconjunto del modelo base) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantización | No disponible (el adaptador es safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no indica licencia; el modelo base tampoco se especifica) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `vectionlabs/Salience-27B-R5`. La técnica LoRA consiste en congelar los pesos del modelo base e insertar matrices de bajo rango en las capas de atención y feed-forward, lo que permite entrenar un subconjunto reducido de parámetros. La arquitectura exacta del modelo base no se especifica en la documentación, pero por el nombre se infiere que tiene 27.000 millones de parámetros, probablemente un transformer decoder-only de tipo Mixture-of-Experts o denso, aunque no se puede confirmar.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la biblioteca TRL, y se usa la versión 0.20.0 de PEFT. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, el régimen de entrenamiento (precisión, optimizador, etc.) ni si se aplicaron técnicas como RLHF o DPO. La etiqueta `arxiv:1910.09700` en los metadatos se refiere al paper sobre el cálculo de emisiones de carbono de Lacoste et al. (2019), no a una innovación técnica del modelo.

## Capacidades

- Detección de vulnerabilidades en la cadena de suministro de software (por el nombre del modelo).
- Generación de texto (pipeline `text-generation`).
- Conversación multi-turno (etiqueta `conversational`).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Análisis de seguridad en pipelines CI/CD: el modelo puede revisar configuraciones de pipelines y detectar dependencias comprometidas o patrones de ataque conocidos en la cadena de suministro, aunque requiere una validación manual de sus resultados.
- Auditoría de dependencias de paquetes: puede analizar manifiestos de dependencias (package.json, requirements.txt, etc.) para identificar paquetes sospechosos o versiones con vulnerabilidades conocidas.
- Revisión de código de seguridad: integrable en herramientas de revisión de código para marcar fragmentos que puedan introducir riesgos de supply chain, aunque su precisión no está evaluada.
- Generación de informes de cumplimiento: puede redactar resúmenes de riesgo y recomendaciones de mitigación para equipos de seguridad.
- Investigación de incidentes: puede ayudar a analizar logs y artefactos de un ataque de cadena de suministro para identificar el vector de entrada.
- Educación y formación: puede generar ejemplos de ataques de cadena de suministro para formación de desarrolladores y equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede confirmar el rendimiento del modelo en tareas de detección de vulnerabilidades, razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada: para el adaptador LoRA, el requisito de VRAM viene del modelo base. `Salience-27B-R5` con 27B parámetros requiere aproximadamente 54 GB en FP16, 27 GB en FP8, y unos 14-16 GB en 4-bit (dependiendo de la cuantización). El adaptador añade un overhead mínimo.
- GPU recomendadas: para FP16, GPU con 40-80 GB (A100, H100, A6000). Para 4-bit, puede caber en RTX 3090/4090 (24 GB) o similar.
- Consumer GPU: sí, con cuantización 4-bit y el adaptador aplicado, puede ejecutarse en una RTX 4090 (24 GB), aunque la velocidad será limitada.
- Opciones de despliegue: se puede usar con la librería `transformers` + PEFT, o servir con `vLLM` (si se fusiona el adaptador con el base), `TGI` (Text Generation Inference) o `Ollama` si se convierte a GGUF. Para producción, se recomienda fusionar el adaptador con el modelo base y exportar a un formato optimizado.
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `specialist-vuln-05_supply_chain-salience27b-lora` | 27B (base) | no disponible | no disponible | Hugging Face (adaptador) |
| `vuln-gate-05_supply_chain-lora` (mismo autor) | no disponible | no disponible | apache-2.0 | Hugging Face (adaptador) |
| `vuln-gate-merged-qwen25-lora` (mismo autor) | no disponible | no disponible | no disponible | Hugging Face (adaptador) |

La comparativa se limita a modelos del mismo autor, ya que no hay información sobre modelos equivalentes de otros autores. Los tres son adaptadores LoRA para tareas de detección de vulnerabilidades, pero no se puede comparar rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- La model card del autor está vacía: no se especifican datos de entrenamiento, evaluación, sesgos ni riesgos. Esto impide evaluar la calidad y seguridad del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Riesgo de alucinación: sin datos de evaluación, no se puede cuantificar el riesgo de falsos positivos/negativos en la detección de vulnerabilidades.
- Sesgos: no se puede conocer la composición del dataset de entrenamiento, por lo que puede haber sesgos hacia ciertos lenguajes de programación, ecosistemas o tipos de vulnerabilidades.
- Limitaciones de contexto: depende del modelo base `Salience-27B-R5`, cuya longitud de contexto no se especifica.
- Uso en producción: se recomienda una validación exhaustiva y pruebas en entornos controlados antes de usarlo en pipelines de seguridad críticos.
- El modelo es un adaptador, no un modelo completo: para usarlo se necesita descargar también el modelo base `vectionlabs/Salience-27B-R5`, lo que añade complejidad de despliegue.

## Enlaces

- Modelo en Hugging Face: [SoulInPsyAbstract/specialist-vuln-05_supply_chain-salience27b-lora](https://huggingface.co/SoulInPsyAbstract/specialist-vuln-05_supply_chain-salience27b-lora)
- Modelo base: [vectionlabs/Salience-27B-R5](https://huggingface.co/vectionlabs/Salience-27B-R5) (no se ha podido verificar su model card)
- Modelo relacionado del mismo autor: [SoulInPsyAbstract/vuln-gate-05_supply_chain-lora](https://huggingface.co/SoulInPsyAbstract/vuln-gate-05_supply_chain-lora)
- Referencia de la etiqueta `arxiv:1910.09700`: [Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning"](https://arxiv.org/abs/1910.09700)
