# YFatima/safeshell-qwen3-1.7b-gguf

## Resumen

SafeShell es un ajuste fino del modelo Qwen3-1.7B de Alibaba, publicado por el usuario YFatima en Hugging Face, orientado al analisis de seguridad de comandos de PowerShell. El modelo recibe un comando y devuelve una evaluacion estructurada en JSON con el nivel de riesgo (LOW, MEDIUM o HIGH), la necesidad de revision humana, una explicacion del riesgo y, opcionalmente, una alternativa mas segura. No ejecuta ni intercepta comandos: es exclusivamente un asistente de analisis.

Se trata de un modelo denso de 1.720.574.976 parametros (aproximadamente 1,72 mil millones), derivado de Qwen3-1.7B mediante un ajuste LoRA/QLoRA realizado con Unsloth. El conjunto de entrenamiento es muy reducido (33 ejemplos de entrenamiento, 6 de validacion y 9 de evaluacion), lo que situa al modelo en la categoria de prototipo experimental mas que de herramienta lista para produccion.

Su relevancia actual es acotada pero concreta: cubre un nicho muy especifico (analisis de riesgo de comandos de shell en entornos Windows) y demuestra el patron de especializacion de modelos pequenos mediante ajuste fino con salida estructurada. La distribucion se hace en formato GGUF con cuantizacion Q4_K_M, pensada para inferencia local con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); detalles de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Metodo de ajuste | LoRA / QLoRA con Unsloth (aproximadamente 1,003 % de parametros entrenables) |
| Formato de salida | JSON con esquema fijo (risk_level, requires_human_review, explanation, safer_alternative) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-1.7B, un transformer denso de aproximadamente 1,72 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado mediante LoRA/QLoRA con la libreria Unsloth, entrenando aproximadamente el 1,003 % de los parametros totales. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El conjunto de datos es extremadamente pequeno: 33 ejemplos de entrenamiento, 6 de validacion y 9 de evaluacion. El objetivo del ajuste es ensenar al modelo a producir una respuesta JSON con un esquema fijo que clasifique comandos de PowerShell por nivel de riesgo. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni modos de razonamiento extendido) mas alla del ajuste LoRA y la exportacion a GGUF.

## Capacidades

- Clasificacion de comandos de PowerShell en tres niveles de riesgo: LOW, MEDIUM y HIGH.
- Indicacion booleana de si el comando requiere revision humana.
- Generacion de una explicacion textual del riesgo detectado.
- Sugerencia de una alternativa mas segura o valor nulo si no aplica.
- Salida en JSON conforme a un esquema fijo, validable programaticamente.
- Analisis estatico del comando: no ejecuta, intercepta ni bloquea comandos.
- Capacidad conversacional heredada del modelo base (tag `conversational`), aunque el ajuste esta orientado a la tarea de evaluacion.
- Soporte de tool calling, agentes o razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Revision previa en pipelines de automatizacion: integrar el modelo como paso de validacion que recibe un comando PowerShell generado por otro sistema y devuelve un JSON con el nivel de riesgo antes de que un humano lo apruebe.
- Formacion y concienciacion en seguridad: usar el modelo para explicar por que un comando concreto es peligroso y proponer una alternativa mas segura, como material didactico para equipos de administracion de sistemas Windows.
- Filtrado en asistentes de generacion de comandos: colocar el modelo como capa de analisis entre un LLM generador de comandos y el usuario final, marcando los comandos de riesgo HIGH para revision obligatoria.
- Auditoria de scripts existentes: procesar comandos extraidos de scripts o historiales de PowerShell y generar un informe estructurado con la clasificacion de riesgo de cada uno.
- Prototipado de guardrails en entornos de desarrollo: servir como componente experimental en un sistema de revision de comandos, con la advertencia explicita de que no constituye una frontera de seguridad.
- Inferencia local en estaciones de trabajo: al distribuirse como GGUF Q4_K_M de 1,1 GB, puede ejecutarse con llama.cpp en equipos sin GPU dedicada para pruebas y demostraciones.
- Investigacion sobre ajuste fino de modelos pequenos: sirve como ejemplo reproducible del patron LoRA + Unsloth + exportacion GGUF con salida JSON estructurada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en clasificacion (conjunto de evaluacion de 9 ejemplos) | 7/9 correctos (77,8 %) |
| Conformidad con el esquema JSON | 9/9 |
| Cumplimiento de la politica de revision humana | 9/9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El propio autor advierte que el conjunto de evaluacion es muy pequeno y que los resultados deben considerarse preliminares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para el archivo GGUF Q4_K_M; el consumo real en ejecucion depende del contexto y de la implementacion, pero cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti o superior, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp es la opcion documentada por el autor; Ollama u otros runners compatibles con GGUF son plausibles, aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SafeShell (Qwen3-1.7B ajustado) | 1,72 B | no disponible | GGUF Q4_K_M | other | Analisis de seguridad de comandos PowerShell |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible en la informacion proporcionada | safetensors y otras | licencia de Qwen3 (no detallada aqui) | Modelo generalista conversacional |
| Alternativas especializadas en analisis de comandos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en analisis de seguridad de comandos de shell en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es experimental y no constituye una frontera de seguridad: no ejecuta, intercepta ni bloquea comandos, y sus evaluaciones pueden ser incorrectas o incompletas.
- El conjunto de entrenamiento es minimo (33 ejemplos), lo que implica un riesgo alto de sobreajuste y de generalizacion deficiente ante comandos no vistos.
- La evaluacion se realizo sobre solo 9 ejemplos; la precision del 77,8 % tiene un intervalo de confianza muy amplio y no es extrapolable.
- Riesgo de alucinacion en las explicaciones y en las alternativas sugeridas: el modelo puede proponer alternativas incorrectas o inseguras.
- Idioma limitado al ingles; no se documenta soporte de castellano ni de otros idiomas.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial, ya que la model card no detalla las condiciones.
- Longitud de contexto no documentada, lo que dificulta planificar su uso con comandos largos o scripts completos.
- No debe sustituir a herramientas de analisis estatico consolidadas ni a la revision humana en entornos de produccion.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YFatima/safeshell-qwen3-1.7b-gguf
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
