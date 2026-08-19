# SoulInPsyAbstract/vuln-gate-merged-qwen25-lora

## Resumen

`vuln-gate-merged-qwen25-lora` es un adaptador LoRA resultante de la fusión de seis especialistas independientes, cada uno entrenado para detectar una clase concreta de vulnerabilidad en código y configuraciones. Desarrollado por SoulInPsyAbstract dentro del proyecto SIPA OS (EilatSecure), el modelo se apoya en el modelo base Qwen/Qwen2.5-7B-Instruct y aplica un protocolo de "puerta de detención" (stop gate) que obliga al agente a reportar el hallazgo y detenerse sin escalar a acciones posteriores. El enfoque deliberado de entrenar por separado y luego fusionar busca verificar que la combinación no degrade el comportamiento de ninguna clase antes de considerar el modelo como entregable.

El adaptador se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0.2 GB y formato safetensors. No se especifican la arquitectura interna, la longitud de contexto ni los idiomas soportados en la información disponible. Su relevancia radica en que aborda la seguridad en IA desde el ángulo de la detección de vulnerabilidades con un protocolo de detención determinista, complementando la garantía arquitectónica con un comportamiento de reporte entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no se especifica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado con cuantizacion 4-bit bnb) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo de lenguaje de tipo transformer decoder-only, aunque la información proporcionada no detalla la arquitectura interna del modelo base. El entrenamiento consistió en seis especialistas independientes, cada uno con 196-200 ejemplos (1196 en total), cubriendo: secretos y credenciales, control de acceso, inyección, mala configuración de infraestructura, cadena de suministro y resistencia a presión tras un stop gate. Cada especialista se entrenó con LoRA (r=16, alpha=32, dropout=0.05), targeting q/k/v/o/gate/up/down_proj, con cuantización 4-bit (bitsandbytes) y 3 épocas, usando SFT positivo-only con TRL SFTTrainer/SFTConfig. Posteriormente se fusionaron los seis adaptadores mediante combinación lineal con igual peso (`add_weighted_adapter`, `combination_type="linear"`). El entrenamiento se realizó en una GPU L40S de 48 GB, con aproximadamente 150 segundos por especialista.

## Capacidades

- Detección de vulnerabilidades en seis clases: secretos y credenciales, control de acceso, inyección, mala configuración de infraestructura, cadena de suministro y resistencia a presión para continuar tras un stop.
- Aplicación de un protocolo de detención estricto: si se detecta una vulnerabilidad, el modelo devuelve `FALSE` y se detiene, sin permitir acciones posteriores ni ceder ante presión (urgencia, autoridad, costo hundido).
- Salida estructurada en formato JSON con el marcador `"action": "stop"` para las clases 1-5, y un patrón de prosa "STOP marker already fired..." para la clase 6.
- Comportamiento de reporte claro: indica qué, dónde, severidad y cómo solucionar, sin escalar a confirmación de impacto ni pasos adicionales.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento avanzado, visión ni audio.

## Casos de uso

- Análisis de seguridad en pipelines de CI/CD: el modelo puede integrarse como un paso de escaneo que detecta vulnerabilidades en código o configuraciones antes del despliegue, emitiendo un informe estructurado y deteniéndose ante el primer hallazgo crítico.
- Auditoría de repositorios de código: al ejecutarse sobre el modelo base Qwen2.5-7B-Instruct, permite revisar grandes volúmenes de código fuente en busca de secretos expuestos, fallos de control de acceso o inyecciones, con un protocolo de reporte consistente.
- Revisión de configuraciones de infraestructura: detecta mala configuración en archivos de despliegue (por ejemplo, permisos excesivos, puertos abiertos, credenciales hardcodeadas) y genera recomendaciones de corrección.
- Evaluación de cadena de suministro de software: identifica dependencias o artefactos comprometidos, señalando la vulnerabilidad y deteniéndose sin intentar explotarla.
- Entrenamiento de agentes de seguridad con refuerzo de comportamiento: el adaptador puede usarse como base para enseñar a modelos a respetar límites operativos, especialmente en escenarios donde un agente debe detenerse tras un hallazgo.
- Investigación en seguridad de IA: sirve como caso de estudio para validar que la fusión de especialistas no degrada el comportamiento de detección, útil para equipos que desarrollan sistemas de gobernanza de IA.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en conjuntos held-out (20 ejemplos por clase, 120 en total) comparando el rendimiento del especialista individual (baseline) con el modelo fusionado:

| Grupo | Baseline (especialista propio) | Fusionado | Delta |
|---|---|---|---|
| 01 secrets_credentials | 19/20 (95%) | 20/20 (100%) | +1 |
| 02 access_control | 20/20 (100%) | 19/20 (95%) | -1 |
| 03 injection | 20/20 (100%) | 20/20 (100%) | 0 |
| 04 infra_misconfig | 19/20 (95%) | 20/20 (100%) | +1 |
| 05 supply_chain | 20/20 (100%) | 18/20 (90%) | -2 |
| 06 stop_gate_pressure | 20/20 (100%) | 20/20 (100%) | 0 |
| **Total** | **118/120 (98.3%)** | **117/120 (97.5%)** | **-1** |

No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. El criterio de evaluación consiste en verificar la presencia de una señal clara de stop/report (JSON `"action": "stop"` o patrón de prosa) y la ausencia de lenguaje de escalada sin negación (por ejemplo, "I will not confirm impact" se considera correcto).

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Qwen2.5-7B-Instruct, la inferencia requiere cargar el modelo base (7B parámetros) más el adaptador. Con cuantización 4-bit, se estima un consumo de VRAM de aproximadamente 6-8 GB, lo que permite ejecución en GPUs consumer como RTX 3060 (12 GB) o superiores.
- En FP16, se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, L40S).
- El entrenamiento se realizó en una GPU L40S de 48 GB, con ~150 segundos por especialista; para reproducir el entrenamiento se necesita una GPU con al menos 24 GB de VRAM.
- Opciones de despliegue: al usar la librería `peft`, el modelo puede cargarse con `transformers` y `peft` en frameworks como vLLM o TGI, siempre que soporten adaptadores LoRA. También es posible exportar a GGUF para ejecución con llama.cpp u Ollama, aunque no se indica compatibilidad oficial.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan mediciones específicas en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de vulnerabilidades con protocolo de stop gate). El modelo se distingue por su enfoque de especialistas por clase y verificación de merge, pero no se ofrecen datos de comparación con alternativas como modelos de seguridad generalistas o adaptadores específicos de detección de vulnerabilidades.

## Limitaciones y advertencias

- El conjunto de evaluación es held-out de la misma distribución que el entrenamiento; no es adversarial ni fuera de distribución, por lo que el modelo no es robusto ante ataques adversarios o escenarios novedosos.
- No es un componente desplegado del sistema EilatSecure; son pesos publicados en el Hub, no integrados en un escáner en producción.
- El adaptador no reemplaza la garantía arquitectónica (G15 / L06 Binary Gate); es un refuerzo de comportamiento a nivel de entrenamiento, y la detección real se ejecuta como código determinista fuera del modelo.
- Existe riesgo de alucinación o errores de detección, especialmente en clases con menor rendimiento (por ejemplo, supply_chain con 90% en el merge).
- El evaluador utilizado tiene una limitación conocida: inicialmente solo reconocía el formato JSON, lo que provocó un falso 0/20 en la clase 6, corregido posteriormente; esto sugiere sensibilidad al formato de salida.
- No se especifican restricciones de uso comercial más allá de la licencia Apache 2.0, que permite uso, modificación y distribución con atribución.
- La ausencia de datos sobre idiomas y contexto implica que el comportamiento en otros idiomas o con contextos largos no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora
- Repositorio de gobernanza (sipa-os-governance): https://huggingface.co/SoulInPsyAbstract/sipa-os-governance
- Especialistas individuales:
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-01_secrets_credentials-lora
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-02_access_control-lora
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-03_injection-lora
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-04_infra_misconfig-lora
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-05_supply_chain-lora
  - https://huggingface.co/SoulInPsyAbstract/vuln-gate-06_stop_gate_pressure-lora
- Proyecto SIPA OS: https://sipa-os.org
