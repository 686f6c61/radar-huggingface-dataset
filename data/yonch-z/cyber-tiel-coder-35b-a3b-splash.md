# Yonch-Z/Cyber-Tiel-Coder-35B-A3B-Splash

## Resumen

Cyber-Tiel-Coder-35B-A3B-Splash es un paquete de inferencia publicado por el usuario Yonch-Z para el motor Splash, distribuido a traves de HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion comunitaria del checkpoint MLX `peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e` al formato propietario `splash-packed-q4-moe`, pensado para ejecutarse dentro de LM Studio mediante el runtime Splash. El modelo subyacente es Cyber-Tiel-Coder-35B-A3B, un fine-tune de codigo abliterado (sin censura) derivado de Ornith-1.5-35B-A3B, con arquitectura Mixture of Experts de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token (de ahi el sufijo A3B).

La relevancia de este paquete es practica: permite ejecutar un MoE de 35B en cuantizacion de 4 bits sobre hardware de consumo, con soporte de vision, plantilla de chat propia con control de esfuerzo de razonamiento y un modelo draft de decodificacion especulativa (DFlash2) incluido. El repositorio ocupa 20,9 GB e integra cuatro componentes: los pesos objetivo, el draft de especulacion, la torre de vision y el tokenizer del vocabulario Qwen3.5-MoE (248.044 tokens).

Se trata de una publicacion con 0 descargas y 0 likes en el momento de la consulta, con licencia MIT, y con una restriccion tecnica critica: solo es compatible con Splash 1.3.0, ya que la version 1.3.1 elimino el soporte del formato empaquetado legacy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer; etiquetado como `qwen3_5_moe`; 40 capas segun las notas de conversion |
| Parametros totales | 35B (35.000 millones, segun nomenclatura del autor) |
| Parametros activos | A3B, aproximadamente 3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (secciones Splash); gate del router en 8 bits; el checkpoint MLX de origen usaba cuantizacion dinamica oQ de 4/5/6/8 bits por tensor |
| Idiomas soportados | no disponible (vocabulario Qwen3.5-MoE de 248.044 tokens) |
| Licencia | MIT |
| Formato de pesos | `splash-packed-q4-moe` (formato empaquetado propietario de Splash para LM Studio); existen variantes GGUF y MLX del mismo modelo base |
| Tamano del repositorio | 20,9 GB |
| Modalidades | Texto e imagen (pipeline `image-text-to-text`, incluye torre de vision) |
| Decodificacion especulativa | Si, modelo draft DFlash2 incluido en `draft/` |
| Libreria | Splash |

## Arquitectura y entrenamiento

El modelo subyacente es un Mixture of Experts con 35.000 millones de parametros totales y unos 3.000 millones activos por token, distribuidos en 40 capas segun las notas de conversion del paquete. El vocabulario corresponde a la familia Qwen3.5-MoE (248.044 tokens) y la arquitectura aparece etiquetada como `qwen3_5_moe`. El modelo base declarado es Ornith-1.5-35B-A3B, sobre el que peculiar-ragdoll aplico un proceso de abliteracion (eliminacion de direcciones de rechazo en el espacio de activaciones) para producir la variante sin censura Cyber-Tiel-Coder, ademas de un fine-tune orientado a codigo. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO: esos datos no estan disponibles.

La innovacion tecnica de este paquete concreto no esta en el entrenamiento sino en el formato de despliegue. Los pesos originales en MLX usaban cuantizacion dinamica oQ con precisiones mixtas (4/5/6/8 bits por tensor); durante la conversion, los tensores que no estaban ya en 4 bits se desquantizaron a BF16 y se requantizaron a 4-bit affine con group size 64 siguiendo el esquema de MLX, y el gate del router de 8 bits se cuantizo desde BF16. El autor advierte de que esto introduce pequenas diferencias de calidad respecto al checkpoint MLX original. El repositorio incluye ademas un modelo draft DFlash2 para decodificacion especulativa, reutilizado sin cambios del paquete `incoai/Qwen3.6-35B-A3B-Splash`; ese draft se entreno contra el Qwen3.6-35B-A3B estandar, no contra este fine-tune, por lo que las tasas de aceptacion especulativa estan sin verificar.

## Capacidades

- Generacion de texto y codigo: el modelo esta especificamente ajustado (fine-tune) para tareas de programacion.
- Razonamiento con control de esfuerzo: la plantilla de chat propia incluye controles de "reasoning effort", lo que permite modular la profundidad de razonamiento.
- Tool calling y function calling: etiquetado explicitamente con `tool-calling` y `function-calling`.
- Flujos agenticos: etiquetado como `agents` y `agentic`, orientado a razonamiento multi-paso y uso de herramientas.
- Procesamiento de imagen: pipeline `image-text-to-text` e inclusion de una torre de vision funcional (reutilizada del paquete oficial de 35B).
- Comportamiento sin censura: variante abliterada con rechazos reducidos, segun la model card.
- Decodificacion especulativa: soporte nativo de DFlash2 a traves del componente draft, con aceleracion potencial de la generacion (tasa de aceptacion no verificada).
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados mas alla del vocabulario base.

## Casos de uso

- Asistencia de programacion en local: dado que el modelo esta afinado para codigo y cabe en 20,9 GB en 4 bits, se puede desplegar en un equipo con GPU de 24 GB para autocompletado, refactorizacion y explicacion de codigo sin enviar datos a la nube.
- Agentes de codigo autonomas: sus etiquetas de tool calling y agentic permiten construir bucles de razonamiento multi-paso que invocan funciones, ejecutan tests y aplican parches en un repositorio.
- Integracion en pipelines de CI/CD: el soporte de function calling facilita conectar el modelo a herramientas de build, linters o revision de pull requests como paso automatizado de comprobacion.
- Analisis de capturas y diagramas tecnicos: al disponer de torre de vision, puede extraer descripciones de diagramas de arquitectura, capturas de errores o interfaces graficas y convertirlas en texto accionable.
- Procesamiento de documentacion tecnica con imagenes: combinacion de entrada texto e imagen para resumir manuales, fichas de API o documentacion escaneada.
- Investigacion sobre alineacion y abliteracion: al ser una variante sin censura, resulta util para estudiar comportamiento de rechazo, sesgos residuales y efectos de la abliteracion en tareas de codigo.
- Generacion de codigo en entornos con requisitos de privacidad: la ejecucion local via LM Studio con Splash evita la dependencia de APIs externas, util en entornos regulados.
- Prototipado rapido de herramientas de desarrollo: 3.000 millones de parametros activos por token reducen el coste computacional por peticion frente a un modelo denso de 35B, lo que abarata la iteracion en prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado en los resultados de busqueda web. El unico dato de rendimiento mencionado es cualitativo: las tasas de aceptacion de la decodificacion especulativa DFlash2 sobre este fine-tune estan explicitamente sin verificar, y el autor anticipa pequenas diferencias de calidad frente al checkpoint MLX original debido a la requantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 20-22 GB para los pesos en 4 bits, dado que el repositorio ocupa 20,9 GB; hay que anadir el consumo del modelo draft de especulacion, la torre de vision y la cache KV, lo que en la practica exige margen adicional.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB). Las GPU de 24 GB son el minimo practico.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, siempre que se ajuste la longitud de contexto. En tarjetas de 16 GB o menos no es viable sin reducir aun mas la precision o descargar capas a CPU.
- Opciones de despliegue: LM Studio con el runtime Splash en version 1.3.0 exclusivamente. Para otras rutas de despliegue existen variantes del mismo modelo base en GGUF y MLX; el ecosistema Splash no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de latencia en la informacion proporcionada.
- Advertencia de despliegue: si LM Studio tiene activadas las actualizaciones automaticas de runtime, hay que desactivarlas antes de instalar el paquete, ya que Splash 1.3.1 y posteriores no cargaran este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-Splash (este) | 35B totales / 3B activos | no disponible | Splash packed q4 MoE, con vision y draft DFlash2 | MIT | HuggingFace, 0 descargas |
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e (base) | 35B totales / 3B activos | no disponible | MLX, cuantizacion dinamica 4/5/6/8 bits | no disponible | HuggingFace |
| Cyber-Tiel-Coder-35B-A3B-GGUF | 35B totales / 3B activos | no disponible | GGUF, 20,7 GB | no disponible | HuggingFace y espejos de terceros |
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35B totales / 3B activos | no disponible | MLX 6 bits con MTP | no disponible | HuggingFace |
| incoai/Qwen3.6-35B-A3B-Splash | 35B totales / 3B activos | no disponible | Splash packed | no disponible | HuggingFace |

Nota: no se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a formato, empaquetado y licencia, ya que la informacion disponible no incluye cifras de benchmarks ni especificaciones completas de los modelos alternativos.

## Limitaciones y advertencias

- Compatibilidad de runtime muy restringida: solo funciona con Splash 1.3.0. Las versiones 1.3.1 y posteriores eliminaron el soporte del formato empaquetado legacy, por lo que el modelo no cargara. Desactivar las actualizaciones automaticas de LM Studio antes de instalarlo.
- Perdida de calidad por requantizacion: los tensores que no estaban en 4 bits se desquantizaron a BF16 y se requantizaron a 4-bit affine con group size 64. El propio autor advierte de diferencias de calidad respecto al checkpoint MLX original.
- Decodificacion especulativa no validada: el draft DFlash2 se entreno contra Qwen3.6-35B-A3B estandar, no contra este fine-tune, y las tasas de aceptacion estan sin verificar. El beneficio real de velocidad es incierto.
- Modelo abliterado y sin censura: la eliminacion de direcciones de rechazo puede degradar la adherencia a politicas de seguridad y aumentar la probabilidad de generar contenido inapropiado, inseguro o directamente incorrecto. No es recomendable en aplicaciones de cara al publico sin capas adicionales de Moderacion.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Como cualquier modelo generativo, puede producir codigo y afirmaciones plausibles pero erroneas.
- Idiomas: no se documentan idiomas soportados. No se puede asumir un rendimiento multilingue homogeneo mas alla del ingles y del chino del modelo base.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, dato critico para dimensionar cache KV y para decidir si el modelo sirve para tareas de contexto largo.
- Distribucion no oficial: es una conversion comunitaria no afiliada a peculiar-ragdoll ni a IncoAI. No hay garantia de mantenimiento, soporte ni actualizaciones.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por terceros.
- Licencia: MIT segun la model card, lo que en principio permite uso comercial, pero la licencia del modelo base Ornith-1.5-35B-A3B no se especifica en la informacion disponible; conviene verificarla antes de un uso comercial.

## Enlaces

- Paquete Splash en HuggingFace: https://huggingface.co/Yonch-Z/Cyber-Tiel-Coder-35B-A3B-Splash
- Modelo base MLX oQ4e (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base sin cuantizar (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B
- Variante GGUF (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Variante MLX oQ6e con MTP: https://huggingface.co/dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Paquete Splash de origen del draft y la vision (IncoAI): https://huggingface.co/incoai/Qwen3.6-35B-A3B-Splash
- Repositorio del formato Splash: https://github.com/incoai/splash
- Ficha informativa de la variante abliterada: https://www.abliteratedmodels.org/cyber-tiel-coder-35b-a3b/
- Espejo GGUF con MTP: https://local-ai-zone.github.io/models/cyber-tiel-coder-35b-a3b-gguf-mtp.html
- Espejo GGUF: https://local-ai-zone.github.io/models/cyber-tiel-coder-35b-a3b.html
