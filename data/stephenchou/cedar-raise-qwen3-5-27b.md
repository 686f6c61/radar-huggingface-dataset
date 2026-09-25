# StephenChou/cedar-raise-qwen3.5-27b

## Resumen

Cedar RAISE Qwen3.5-27B es un adaptador LoRA de ajuste fino por refuerzo (RAISE, con entrenamiento tipo GRPO) publicado por el usuario StephenChou sobre el modelo base `StephenChou/cedar-qwen27b-sft-v2`, que a su vez deriva de Qwen3.5-27B. Su proposito es muy concreto: traducir requisitos de control de acceso expresados en lenguaje natural a politicas formales escritas en Cedar, el lenguaje de politicas de autorizacion. No es un modelo de proposito general, sino un adaptador especializado en una unica tarea de generacion de codigo estructurado.

El modelo es relevante porque aborda una tarea con verificacion objetiva: las politicas generadas se pueden comprobar sintacticamente con el parser de Cedar y semanticamente con comprobaciones de autorizacion. Eso permite usar RL con recompensas verificables, un patron habitual en modelos de razonamiento y codigo. Con 27B parametros en arquitectura densa y un contexto heredado del modelo base de 262.144 tokens, el adaptador se orienta a investigacion, no a despliegue directo en produccion.

El repositorio pesa 0,8 GB y contiene unicamente los pesos del adaptador en formato safetensors para PEFT, con licencia Apache-2.0. Las cifras publicadas por el autor muestran una validacion sintactica del 99,73% pero un exito semantico del 48,00% sobre 375 escenarios retenidos, lo que marca con claridad el estado de madurez de la tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-27B) con adaptador LoRA via PEFT |
| Parametros totales | 27B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens segun especificaciones publicas del modelo base Qwen3.5-27B; no confirmado especificamente para este adaptador |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0.05 |
| Modelo base | StephenChou/cedar-qwen27b-sft-v2 |
| Checkpoint final | paso 518 (2 epocas) |
| Ejecucion de entrenamiento | grpo_v2_27b_oc_m8_b16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 27B parametros perteneciente a la familia Qwen3.5, que segun las especificaciones publicas combina Gated Delta Networks con redes feed-forward y soporte multimodal de vision-lenguaje con contexto nativo de 262.144 tokens. Sobre esa base, el autor aplica un ajuste supervisado previo (`cedar-qwen27b-sft-v2`) y despues un adaptador LoRA de rango 32 y alpha 64 con dropout 0,05, entrenado mediante RL verificable (RAISE) en la ejecucion `grpo_v2_27b_oc_m8_b16`. El entrenamiento completo son 2 epocas y el checkpoint publicado es el paso 518.

La innovacion tecnica central es el uso de recompensas comprobables sobre la salida del modelo: la validez de la politica Cedar se puede verificar con el parser oficial y con comprobaciones semanticas de autorizacion, lo que permite optimizar directamente la correccion formal en lugar de depender solo de preferencias humanas. No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el detalle del algoritmo de RL mas alla del nombre de la ejecucion (GRPO).

## Capacidades

- Generacion de politicas Cedar a partir de requisitos de control de acceso en lenguaje natural.
- Salida de codigo estructurado con alta validez sintactica (99,73% en la evaluacion publicada).
- Razonamiento sobre reglas de autorizacion: permisos, prohibiciones y condiciones.
- Generacion de texto y conversacion como capacidades heredadas del modelo base Qwen3.5-27B, aunque no optimizadas por este adaptador.
- Capacidades multimodales y de razonamiento general del modelo base, no evaluadas ni garantizadas tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Asistencia a ingenieros de seguridad: el modelo convierte una descripcion funcional ("los editores pueden modificar documentos de su departamento") en una politica Cedar lista para revisar, reduciendo el tiempo de redaccion manual.
- Migracion de politicas heredadas: a partir de reglas de negocio documentadas en prosa, generar borradores de politicas Cedar que despues se validan con el parser antes de sustituir el sistema anterior.
- Generacion de tests de autorizacion: usar el modelo para producir pares de peticiones permitidas y denegadas que sirvan como casos de prueba de un motor de politicas Cedar.
- Analisis de cobertura de politicas: dado un conjunto de requisitos, generar politicas candidatas y comparar su comportamiento con las existentes para detectar huecos de autorizacion.
- Investigacion en RL con recompensas verificables: el adaptador es un caso de estudio reproducible de como aplicar GRPO a una tarea de codigo formal con verificacion automatica.
- Formacion y documentacion interna: explicar en lenguaje natural que hace una politica Cedar concreta invirtiendo la direccion de la tarea.
- Preprocesado en pipelines de IaC: integrar el adaptador como paso de sugerencia en revisiones de pull requests que introducen cambios de permisos, siempre con validacion humana posterior.

## Benchmarks y rendimiento

Evaluacion greedy del autor sobre 375 escenarios independientes de CedarInstruct (conjunto retenido):

| Metrica | Resultado |
|---|---|
| Validez sintactica | 99,73% (374/375) |
| Exito semantico | 48,00% (180/375) |
| Puntuacion macro por comprobacion | 81,66% |
| Puntuacion micro por comprobacion | 80,83% |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base de 27B: aproximadamente 54 GB en FP16/BF16, unos 27-28 GB en INT8 y 14-16 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB o 2x RTX 4090 para INT8; RTX 4090 (24 GB) viable con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, con margen ajustado para contexto largo.
- Opciones de despliegue: transformers junto con PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, y llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- El repositorio contiene solo el adaptador (0,8 GB), por lo que siempre hay que descargar ademas el modelo base `StephenChou/cedar-qwen27b-sft-v2`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cedar-raise-qwen3.5-27b | 27B + LoRA r32 | 262.144 tokens (base) | Generacion de politicas Cedar | Apache-2.0 | Adaptador PEFT en HuggingFace |
| cedar-qwen27b-sft-v2 | 27B + adaptador SFT | 262.144 tokens (base) | Generacion de politicas Cedar | Apache-2.0 | Modelo base en HuggingFace; metricas comparativas no disponibles |
| Qwen3.5-27B | 27B denso | 262.144 tokens | Proposito general multimodal | No disponible en la informacion proporcionada | HuggingFace, LM Studio, Azure AI Foundry |
| Modelos generalistas tipo Llama o Mistral en prompt directo | Variable | Variable | Generacion de Cedar sin ajuste especifico | Variable | Amplia; sin evaluacion comparable publicada para esta tarea |

No se dispone de resultados de benchmarks de alternativas sobre el mismo conjunto CedarInstruct, por lo que la comparacion de rendimiento entre modelos no esta disponible.

## Limitaciones y advertencias

- El exito semantico es del 48,00%: casi la mitad de las politicas generadas no satisfacen correctamente el requisito de autorizacion aunque sean sintacticamente validas. Es imprescindible validar con el parser de Cedar y con comprobaciones semanticas antes de cualquier despliegue.
- Riesgo de alucinacion en la semantica de las politicas: una politica bien formada puede conceder o denegar permisos distintos de los pretendidos, con consecuencias de seguridad.
- Idioma limitado al ingles: las etiquetas del repositorio solo declaran `en`, y no hay evidencia de calidad en castellano u otros idiomas.
- Uso previsto exclusivamente de investigacion segun el propio autor; no esta pensado para produccion sin capas de validacion adicionales.
- Licencia Apache-2.0, que permite uso comercial, pero heredada del modelo base; conviene verificar las condiciones del modelo Qwen3.5-27B subyacente si el uso es comercial.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base o fusionar los pesos, lo que anade pasos operativos y consumo de disco.
- La evaluacion se realizo sobre 375 escenarios de un unico conjunto (CedarInstruct), sin datos de generalizacion a otros dominios ni de robustez ante entradas ambiguas.
- No hay informacion publica sobre sesgos, comportamiento ante prompts adversarios ni estabilidad en contextos muy largos.

## Enlaces

- [StephenChou/cedar-raise-qwen3.5-27b en HuggingFace](https://huggingface.co/StephenChou/cedar-raise-qwen3.5-27b)
- [Modelo base StephenChou/cedar-qwen27b-sft-v2](https://huggingface.co/StephenChou/cedar-qwen27b-sft-v2)
- [Qwen/Qwen3.5-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Qwen3.5-27B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-27b)
- [Qwen3.5-27B en Microsoft Foundry](https://ai.azure.com/catalog/models/qwen-qwen3.5-27b)
- [Qwen3.5 27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-5-27b/)
- [Qwen3.5-27B: especificaciones y requisitos de VRAM](https://apxml.com/models/qwen35-27b)
