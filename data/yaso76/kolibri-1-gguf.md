# Yaso76/Kolibri-1-GGUF

## Resumen

Kolibri-1 GGUF es una conversión no oficial a formato GGUF del modelo Kolibri-1 de Aleph Alpha, publicada por el usuario Yaso76 en Hugging Face. Se trata de una cuantización Q8_0 generada con el conversor oficial de llama.cpp a partir de los pesos BF16 originales, pensada para cargarse directamente en versiones mainline de llama.cpp (b11709 o posteriores) sin necesidad de parches ni de `--override-kv`. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) orientado a generación de texto conversacional en alemán e inglés.

Con 78.103.074.560 parámetros totales (unos 78,1 mil millones), el modelo conserva una ventana de contexto declarada de 262.144 tokens en el GGUF, aunque la model card original menciona hasta 1.048.576 tokens recomendando no superar los 262.144 en servicio. La conversión ocupa 83,1 GB repartidos en cinco ficheros y mantiene una plantilla de chat embebida, además de soporte para tool calling estilo Hermes y un mecanismo de esfuerzo de razonamiento configurable (`reasoning_effort`).

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo de gama alta con memoria unificada, como el AMD Ryzen AI Max+ 395 con 128 GB, sin depender de GPUs de datacenter. Es, por tanto, una vía práctica para probar localmente un modelo alemán de última generación con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (identificador `kolibri1` en llama.cpp) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en el GGUF; la model card original declara 1.048.576 y recomienda 262.144 para servicio |
| Tipos de cuantizacion | Q8_0 (8,51 bits por peso); 502 tensores Q8_0 y 401 tensores F32 |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dividido en 5 ficheros (safetensors BF16 como origen) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos, identificada como `kolibri1` en el ecosistema llama.cpp. La atención combina ventanas deslizantes con atención completa según un patrón de 50 entradas en proporción 4:1 (cuatro capas de ventana deslizante de 513 tokens por cada capa de atención completa). El tokenizador usa el preprocesador `qwen2` y la función de gating de expertos está codificada con `expert_gating_func = 2`. La plantilla de chat viene embebida en el GGUF.

La conversión se realizó con el conversor oficial de llama.cpp en la release b11889, partiendo del commit `38a4e5bc3c3192d1f458d043ac1a063a6380fdbd` del repositorio BF16 de Aleph Alpha, con verificación SHA256 de los 32 safetensors de origen. El proceso consistió en convertir a BF16 GGUF, cuantizar a Q8_0 con 32 hilos y dividir en partes de 20 GB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en alemán e inglés, con resultados correctos y fluidos en las pruebas de humo documentadas.
- Razonamiento configurable mediante la variable de plantilla `reasoning_effort`, con valores `none`, `low`/`minimal`, `medium`, `high`/`xhigh`/`max`; por defecto se aplica `high`. El contenido de razonamiento se devuelve por separado en `reasoning_content`.
- Tool calling en estilo Hermes (`<tool_call>{"name": …, "arguments": …}</tool_call>`), con devolución de `tool_calls` estructurados al usar `--jinja` en llama-server.
- Resolución de problemas aritméticos y de enunciado verbal, verificado en las pruebas con resultado correcto.
- Reescritura de texto con control de tono (por ejemplo, convertir un aviso formal en un registro coloquial).
- Resumen de texto en dos frases con esfuerzo de razonamiento desactivado.
- Soporte multilingüe limitado a alemán e inglés.
- Compatibilidad con la API compatible con OpenAI de llama-server, incluyendo `chat_template_kwargs`.

## Casos de uso

- Asistencia conversacional en alemán para atención al cliente: el modelo mantiene conversaciones multi-turno con contexto amplio (hasta 262.144 tokens en servicio) y permite desactivar el razonamiento con `reasoning_effort: none` para reducir latencia en respuestas simples.
- Generación y revisión de documentación técnica en alemán e inglés: su capacidad de reescritura con control de tono y registro lo hace adecuado para adaptar avisos formales, comunicados o textos internos a distintos públicos.
- Automatización de tareas con herramientas: gracias al tool calling estilo Hermes y a la devolución estructurada de `tool_calls`, puede integrarse en agentes que consulten APIs, bases de datos o sistemas internos.
- Razonamiento matemático y resolución de problemas verbales: útil en asistentes educativos o de soporte financiero donde se requiera cálculo con explicación intermedia, activando `reasoning_effort: high` y separando el razonamiento de la respuesta final.
- Despliegue local en estaciones de trabajo con memoria unificada: al caber en 128 GB de memoria unificada (por ejemplo, Ryzen AI Max+ 395), permite prototipar y evaluar un MoE de 78B sin GPU de datacenter, usando llama.cpp con backend Vulkan.
- Procesamiento de documentos largos: con la ventana de contexto extendida y una caché KV cuantizada a q8_0, puede resumir o extraer información de contratos, informes o expedientes extensos en alemán.
- Integración en pipelines de CI/CD para pruebas de calidad lingüística: la API compatible con OpenAI de llama-server facilita conectar el modelo a herramientas de evaluación automatizada de textos en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 83,1 GB para los pesos Q8_0, más la memoria de la caché KV. En las pruebas se usó una caché KV q8_0 con contexto de 32.768 tokens.
- Hardware de referencia de la conversión y validación: AMD Ryzen AI Max+ 395 con Radeon 8060S y 128 GB de memoria unificada, Fedora 44, backend Vulkan (RADV) de llama.cpp b11889.
- GPU de datacenter: no se documentan pruebas con A100, H100 u otras GPUs discretas en la información disponible.
- GPU de consumo: el tamaño de 83,1 GB impide cargarlo en GPUs consumer con menos de 80 GB de VRAM; encaja en configuraciones con memoria unificada de 128 GB como la citada.
- Opciones de despliegue: llama.cpp b11709 o posterior (probado con b11889 y backend Vulkan). Ollama, LM Studio y otras aplicaciones dependen de la versión de llama.cpp que empaqueten y necesitan b11709 o posterior; no fueron probadas según el autor.
- Comando de referencia: `llama-server -m Kolibri-1-Q8_0-00001-of-00005.gguf -ngl 999 -fa on --jinja -c 32768 --temp 1.0 --top-p 0.97 --top-k 128`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kolibri-1 GGUF (Q8_0) | 78,1B | 262.144 en GGUF (1.048.576 declarado) | Apache 2.0 | GGUF dividido | Conversión no oficial; requiere llama.cpp b11709+ |
| Aleph-Alpha/Kolibri-1-BF16 | 78,1B | 1.048.576 declarado | Apache 2.0 | Safetensors BF16 | Modelo original; sin cuantizar |
| Otras conversiones GGUF de Kolibri-1 en el Hub | 78,1B | Variable | Apache 2.0 | GGUF | Muchas usan el parche previo a la fusión y requieren `--override-kv` en mainline |

No se dispone de información sobre modelos de otros desarrolladores comparables en tamaño, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no fue realizada, revisada ni respaldada por Aleph Alpha; para cualquier duda sobre el modelo en sí debe consultarse la model card original.
- Idiomas limitados a alemán e inglés; no se documenta soporte para castellano ni otras lenguas.
- El GGUF declara 262.144 tokens de contexto, pero la memoria de la caché KV limita el contexto realmente utilizable en máquinas de 128 GB; las pruebas se hicieron con 32.768 tokens.
- Compatibilidad estricta con la versión de llama.cpp: requiere b11709 o posterior; versiones anteriores o aplicaciones con llama.cpp embebido más antiguo no cargarán el modelo sin ajustes.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad factual en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una conversión no oficial conviene verificar la licencia y condiciones del modelo base en su repositorio original.
- El autor no ha probado el modelo en Ollama, LM Studio ni otras aplicaciones de escritorio, por lo que su funcionamiento en esas plataformas no está garantizado.
- El razonamiento se activa por defecto en `high` si no se especifica `reasoning_effort`, lo que incrementa el consumo de tokens y la latencia si no se ajusta.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/Yaso76/Kolibri-1-GGUF
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Model card original de Kolibri-1: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Discusión sobre compatibilidad con mainline: https://huggingface.co/Aleph-Alpha/Kolibri-1/discussions/3
- Release de llama.cpp b11889: https://github.com/ggml-org/llama.cpp/releases/tag/b11889
- PR de soporte de Kolibri-1 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30673
