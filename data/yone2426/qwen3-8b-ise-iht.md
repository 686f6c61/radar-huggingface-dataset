# yone2426/Qwen3-8B-ISE-IHT

## Resumen

Qwen3-8B-ISE-IHT es un checkpoint de ajuste fino completo publicado por el usuario yone2426 sobre `Qwen/Qwen3-8B-Base`. Su particularidad es que no se limita a un reajuste convencional: incorpora una «tabla ISE» aprendida junto al backbone, diseñada para aplicar una jerarquía de instrucciones estricta con cuatro roles codificados (system=0, user=1, data=2, assistant=3). La separación del rol `data` es la pieza clave: permite marcar contenido no confiable (texto recuperado, páginas web, correos de terceros) como material de menor privilegio, un mecanismo orientado a mitigar ataques de prompt injection en sistemas con agentes.

El modelo se presenta explícitamente como una reproducción del trabajo ISE, derivado del repositorio `tongwu2020/ISE` en el commit `d88eff2d34bc3b6ec03071091d7be8a0b94ba422`. La implementación oficial de ese proyecto está pensada para Llama, y Qwen3 figura como una extensión del autor de esta ficha, por lo que la reproducibilidad exacta de los resultados originales no está garantizada. El repositorio pesa 16,4 GB y contiene tanto el backbone reajustado como la tabla ISE en formato propio.

Es relevante ahora porque la defensa frente a instrucciones maliciosas embebidas en datos es uno de los problemas abiertos más serios en el despliegue de agentes, y los enfoques de jerarquía de instrucciones son una de las líneas de investigación activas. Ahora bien, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Qwen3-8B-Base) mas una tabla ISE aprendida, cuyo funcionamiento interno no se detalla en la informacion disponible |
| Parametros totales | Aproximadamente 8.200 millones, segun la documentacion publica de Qwen3-8B-Base; no verificado en este repositorio. El tamano del repo (16,4 GB) es compatible con pesos en bf16/fp16 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio. El modelo base declara 32.768 tokens nativos, extensibles a 131.072 mediante YaRN, segun su documentacion publica |
| Tipos de cuantizacion | No disponible. Solo se confirma el formato safetensors del repo; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones de la tabla ISE |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible. El autor indica que «se siguen aplicando los terminos del modelo base y de los datos de origen», sin concretar cuales |
| Formato de pesos | safetensors (backbone) mas una tabla ISE en formato propio no especificado |

## Arquitectura y entrenamiento

La base es un transformer decoder denso de la familia Qwen3, en su variante Base (sin ajuste de instrucciones conversacional). Sobre ese backbone, el autor ha realizado un ajuste fino completo («full fine-tuned backbone») y ha aprendido adicionalmente una tabla ISE que se guarda como artefacto separado dentro del checkpoint. El esquema de cuatro roles (system=0, user=1, data=2, assistant=3) sugiere que el entrenamiento introduce tokens o marcadores de rol que permiten al modelo ponderar de forma distinta la autoridad de cada fragmento de contexto, tratando `data` como contenido no fiable.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset, ni de si se emplearon tecnicas de alineamiento como RLHF, DPO o similares. El autor remite a los ficheros `training_metadata.json` y `data_manifest.json` del repositorio para los ajustes exactos y la procedencia de los datos, pero su contenido no se ha facilitado en esta consulta. La innovacion tecnica declarada es precisamente la tabla ISE y la jerarquia de roles; el resto de la arquitectura es la del modelo base.

Un detalle critico de implementacion: cargar unicamente el subdirectorio `base_model/` con `AutoModel` omite la tabla ISE y, segun el autor, no constituye una evaluacion valida del modelo. La ruta correcta es instalar el paquete incluido (`pip install -e .`) y usar `ise_repro.model.load_ise_checkpoint(path_or_repo)` o el script `generate.py`.

## Capacidades

- Generacion de texto en general, en la medida en que lo permite el backbone Qwen3-8B-Base; no hay evaluaciones publicadas que lo confirmen.
- Diferenciacion explicita de cuatro roles de contexto (system, user, data, assistant), con `data` como rol de menor privilegio.
- Resistencia a prompt injection mediante jerarquia de instrucciones: es el objetivo declarado del modelo, aunque no se aportan metricas de eficacia.
- Reproduccion de experimentos ISE sobre una base distinta a la del trabajo original (que apunta a Llama).
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base, no verificadas ni documentadas en esta ficha.
- Tool calling / function calling: no confirmado. Al derivar de una variante Base, es probable que no incluya plantilla de chat ni formato de herramientas, extremo que no se puede confirmar con la informacion disponible.
- Modo thinking, vision o audio: no disponible / no documentado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes con recuperacion aumentada (RAG): el contenido recuperado se etiqueta con el rol `data` (2) y el modelo lo trata como no fiable, reduciendo el riesgo de que un documento envenenado secuestre el comportamiento del agente.
- Procesamiento de correos, tickets o documentos de terceros: el texto entrante se marca como `data`, mientras que las politicas de la aplicacion viajan en `system`, lo que crea una separacion de privilegios aprovechable en flujos de automatizacion documental.
- Navegacion web automatizada y scraping: el HTML o texto extraido de paginas externas es el vector clasico de inyeccion indirecta; mapearlo al rol `data` es exactamente el escenario para el que se diseño el esquema de cuatro roles.
- Investigacion en seguridad de LLM y red teaming: el checkpoint sirve para reproducir y comparar ataques de instruction hierarchy sobre una base Qwen3 en lugar de Llama, siempre que se respete la ruta de carga con la tabla ISE.
- Base para ajustes posteriores centrados en seguridad: un equipo puede partir de este checkpoint (con su tabla ISE ya aprendida) y continuar el entrenamiento con datos propios de su dominio.
- Clasificacion y filtrado de instrucciones sospechosas: la distincion entre habla legitima del usuario y contenido inyectado puede aprovecharse para etiquetar entradas en un pipeline de moderacion.
- Evaluacion comparativa de defensas: util para medir si la jerarquia de roles degrada capacidades generales frente al modelo base sin ISE.

En todos los casos conviene tener presente que se trata de un modelo derivado de una variante Base, sin alineamiento conversacional confirmado, por lo que la calidad de las respuestas multi-turno no esta garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de resistencia a prompt injection, y advierte que evaluar cargando solo `base_model/` con `AutoModel` no es una evaluacion valida. Cualquier comparacion numerica requeriria ejecutar el paquete `ise_repro` con la tabla ISE cargada, algo que no se ha hecho en esta ficha.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 16,4 GB solo para pesos, mas la cache KV, que crece con la longitud de contexto y el tamano de lote. Con contexto largo (32.000 tokens) la cache puede anadir varios GB.
- GPU consumer: una RTX 3090 o RTX 4090 (24 GB) permite cargar los pesos en bf16, pero el margen para contexto largo y lotes grandes es reducido. Una RTX 4060 Ti de 16 GB queda al limite y probablemente exija cuantizacion.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB son opciones holgadas para inferencia en precision completa.
- Cuantizacion: no hay cuantizaciones publicadas. Aplicar 8 bits (unos 9 GB) o 4 bits (unos 5-6 GB) permitiria entrar en GPUs de 12-16 GB, pero no esta documentado como cuantizar la tabla ISE, por lo que el resultado podria invalidar el comportamiento del modelo.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros servidores estandar. El autor exige PyTorch mas el paquete `ise_repro` (`pip install -e .`) y el cargador `ise_repro.model.load_ise_checkpoint`. Cualquier motor que cargue solo los tensores safetensors omitira la tabla ISE y dara una evaluacion invalida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentacion publica de cada modelo, no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Particularidad |
|---|---|---|---|---|---|
| yone2426/Qwen3-8B-ISE-IHT | ~8.200 millones (heredado del base) | No disponible en el repo; el base declara 32.768 tokens (131.072 con YaRN) | No disponible | 0 descargas, 0 likes; requiere paquete propio | Tabla ISE aprendida y jerarquia de cuatro roles orientada a prompt injection |
| Qwen/Qwen3-8B-Base | ~8.200 millones | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Ampliamente distribuido | Modelo base sin alineamiento conversacional ni defensas de jerarquia |
| Qwen/Qwen3-8B | ~8.200 millones | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Ampliamente distribuido | Variante post-entrenada con modo thinking y soporte de herramientas |
| meta-llama/Llama-3.1-8B-Instruct | ~8.000 millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | Ampliamente distribuido | Alternativa de referencia en robustez frente a inyeccion, con tier superior de licencia |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia propia y la model card solo senala que se aplican los terminos del modelo base y de los datos de origen. Esto supone un riesgo legal para uso comercial hasta que se aclare.
- Ausencia total de validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes.
- Reproduccion no oficial: la implementacion de referencia de ISE apunta a Llama y la adaptacion a Qwen3 es una extension del autor, sin verificar.
- Dependencia de codigo propietario: cargar solo los safetensors con `AutoModel` invalida el modelo. Cualquier integracion en produccion debe asumir el paquete `ise_repro` como dependencia.
- Base sin alineamiento conversacional: al derivar de Qwen3-8B-Base, no hay garantia de calidad en dialogos multi-turno ni de seguir formatos de herramienta.
- Sin benchmarks: no hay datos de MMLU, codigo, matematicas ni de tasa de exito frente a prompt injection, por lo que no se puede cuantificar la mejora frente a la base.
- Sesgos y alucinacion: no documentados. Al no haber evaluacion, se heredan sin medir los sesgos del modelo base y el riesgo de inventar informacion.
- Contexto e idiomas: no documentados especificamente para este checkpoint; la ventana efectiva depende del modelo base y de como se gestione la tabla ISE.
- Fechas del repositorio: creado y actualizado el 16 de septiembre de 2026 segun los metadatos, sin historial de revisiones visible.
- Las defensas basadas en jerarquia de instrucciones no son inmunes a todos los ataques conocidos; no deben considerarse una solucion completa en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yone2426/Qwen3-8B-ISE-IHT
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio ISE de referencia: https://github.com/tongwu2020/ISE
- Commit concreto del que deriva: https://github.com/tongwu2020/ISE/tree/d88eff2d34bc3b6ec03071091d7be8a0b94ba422
- Ficheros de configuracion citados por el autor (`training_metadata.json` y `data_manifest.json`): alojados en el propio repositorio de HuggingFace, sin URL directa verificada
- Resultados de la busqueda web: no se encontro ningun enlace relacionado con el modelo; los resultados devueltos corresponden a foros sobre Le Bon Coin y no son pertinentes
