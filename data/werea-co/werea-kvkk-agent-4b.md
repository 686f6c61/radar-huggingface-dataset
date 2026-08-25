# Werea-co/Werea-KVKK-Agent-4B

## Resumen

Werea-KVKK-Agent-4B es un adaptador QLoRA de investigación desarrollado por Werea-co, diseñado para ofrecer sugerencias estructuradas y citadas de flujos de trabajo relacionados con la KVKK (Ley de Protección de Datos Personales de Turquía). Se basa en el modelo Qwen/Qwen3-4B y se publica como un componente de un sistema más amplio orientado a la evidencia: los plazos se calculan mediante un motor de reglas, el material legal actualizado proviene de fuentes oficiales versionadas y las acciones consecuentes requieren siempre revisión humana autorizada.

El adaptador se entrenó exclusivamente con escenarios sintéticos deterministas y se distribuye como vista previa de investigación. No constituye asesoramiento legal, no establece conformidad normativa y no debe utilizarse para enviar avisos, elegir base legal, firmar contratos ni eliminar datos de producción de forma autónoma. Su relevancia radica en demostrar un enfoque de IA legal de bajo coste, con citas verificables y rechazo explícito de acciones no seguras, sobre un modelo base abierto.

El repositorio tiene un tamaño de 0,1 GB, formato safetensors y licencia Apache-2.0. Los idiomas soportados son turco e inglés. Al ser un adaptador PEFT, no incluye los pesos completos del modelo base, sino los del ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen/Qwen3-4B (transformer) |
| Parametros totales | No disponible (adaptador: 0,1 GB; modelo base: 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | QLoRA (4-bit) probable, no confirmado |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador de ajuste fino con QLoRA sobre Qwen3-4B, un transformer de 4 mil millones de parametros. El adaptador se entrena con datos sinteticos deterministas del dataset Werea-co/Werea-KVKK-Bench, disenado para generar escenarios de flujo de trabajo KVKK con citas legales y calculo de plazos. No se especifican detalles sobre el numero de tokens de entrenamiento ni sobre tecnicas de RLHF o DPO. La innovacion principal reside en el diseno del sistema: el adaptador se integra en un pipeline "evidence-first" donde las citas se validan contra fuentes oficiales versionadas y las acciones criticas requieren aprobacion humana. El entrenamiento se centra en producir salidas con esquema JSON valido, precision en citas y rechazo de autonomia no segura.

## Capacidades

- Generacion de texto en turco e ingles con enfoque en consultas legales de proteccion de datos.
- Sugerencias de flujos de trabajo KVKK estructuradas con citas legales (precision de citas 1.0 en pruebas internas).
- Calculo de plazos legales (precision 1.0 en pruebas internas).
- Validacion de esquema JSON en las respuestas (validez 1.0 en pruebas internas).
- Rechazo de acciones autonomas no autorizadas (tasa de rechazo 1.0 en pruebas internas).
- Sin fuga de informacion personal identificable (PII) en las salidas (tasa 0.0 en pruebas internas).
- No incluye capacidades de vision, audio ni tool calling explicito; se limita a generacion de texto.

## Casos de uso

- Asistencia a responsables de proteccion de datos (DPO) en la preparacion de notificaciones de violacion de datos: el modelo sugiere pasos y plazos basados en la KVKK, con citas a articulos concretos, pero siempre bajo supervision humana.
- Generacion de plantillas de evaluacion de impacto en la proteccion de datos (DPIA): el adaptador puede estructurar los apartados requeridos y senalar los plazos legales asociados.
- Formacion interna de equipos legales: permite simular escenarios de cumplimiento KVKK con respuestas citadas, util para entrenar a personal junior.
- Integracion en sistemas de gestion de privacidad (PrivacyOps): el adaptador se conecta a un motor de reglas externo que calcula plazos y a un sistema de recuperacion de fuentes oficiales, generando informes preliminares.
- Chatbot de consulta interna sobre procedimientos KVKK: responde con referencias normativas y pasos a seguir, limitado a entornos controlados.
- Auditoria de procesos de tratamiento de datos: el modelo puede proponer secuencias de acciones correctivas basadas en escenarios sinteticos, siempre que un humano valide cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona los siguientes resultados de "release-gate" en su model card:

| Metrica | Valor |
|---|---|
| Citation precision | 1.0 |
| Deadline accuracy | 1.0 |
| JSON schema validity | 1.0 |
| PII leak rate | 0.0 |
| Unsafe autonomy refusal | 1.0 |

Estos datos provienen de pruebas internas sobre escenarios sinteticos y no son comparables con benchmarks generales de modelos de lenguaje.

## Requisitos de hardware

- Al ser un adaptador PEFT, el requisito principal es el del modelo base Qwen3-4B. Para inferencia en FP16 se necesitan aproximadamente 8 GB de VRAM; con cuantizacion de 4 bits (como la usada en QLoRA) puede reducirse a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, A100, H100. Tambien puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- El adaptador en si ocupa 0,1 GB, por lo que el almacenamiento adicional es minimo.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o cualquier framework que soporte modelos PEFT (por ejemplo, Hugging Face Transformers con PEFT).
- Latencia y throughput estimados: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores legales para KVKK). Como referencia, se puede comparar con el modelo base Qwen3-4B, que ofrece capacidades generales de generacion de texto, razonamiento y codigo, pero sin especializacion legal. Otros adaptadores legales existentes (por ejemplo, para GDPR) no estan documentados en la informacion proporcionada. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Werea-KVKK-Agent-4B (adaptador) | 4B (base) | No disponible | KVKK (proteccion de datos turca) | Apache-2.0 |
| Qwen3-4B (base) | 4B | No disponible | General | Apache-2.0 |

## Limitaciones y advertencias

- El modelo es una vista previa de investigacion y no debe usarse en produccion sin validacion exhaustiva.
- Entrenado solo con escenarios sinteticos deterministas; puede no generalizar a casos reales complejos.
- No constituye asesoramiento legal ni establece conformidad con la KVKK.
- No debe utilizarse de forma autonoma para enviar notificaciones, elegir bases legales, firmar contratos o eliminar datos de produccion.
- Las citas legales pueden quedar desactualizadas; el sistema requiere recuperacion de fuentes oficiales versionadas.
- Riesgo de alucinacion en contextos no cubiertos por los datos de entrenamiento.
- Limitado a turco e ingles; no soporta otros idiomas.
- No se han publicado evaluaciones de sesgos ni de robustez ante ataques adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Werea-co/Werea-KVKK-Agent-4B
- Perfil de la organizacion Werea-co: https://huggingface.co/Werea-co/models
- Sitio web de Werea: https://werea.co/en
- Dataset de entrenamiento: https://huggingface.co/datasets/Werea-co/Werea-KVKK-Bench
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
