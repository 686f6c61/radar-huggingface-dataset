# vyogotech/Vyogo-Coder-v1-Devstral-24B

## Resumen

Vyogo-Coder-v1-Devstral-24B es un ajuste fino (fine-tuning) del modelo abierto Devstral-Small-2-24B-Instruct-2512, desarrollado por vyogotech y publicado bajo licencia Apache-2.0. Su propósito es especializar un modelo de código generalista en el dominio del framework Frappe y el ERP ERPNext, cubriendo desde la lógica contable y de inventario hasta la gestión de DocTypes personalizados, hooks y controladores del ciclo de vida de documentos. El modelo parte de una arquitectura Mistral3 multimodal (decodificador de texto ministral3 de 40 capas más una torre de visión pixtral de 24 capas) con 24.011.361.280 parámetros totales.

El problema que aborda es concreto: los modelos de código genéricos funcionan bien en CRUD web estándar pero fallan en tareas de ERP reales, como confundir APIs entre versiones de Frappe (v15, v16, v17), inventar flags de CLI o romper la compatibilidad con PostgreSQL. Este ajuste busca generar código portable con el query builder `frappe.qb`, evitar antipatrones en producción (consultas N+1, `frappe.db.commit()` dispersos, `ignore_permissions=True`) y producir tests con `FrappeTestCase`.

Es relevante ahora porque ofrece una alternativa autoalojada, sin coste por token y sin dependencia de proveedores externos, para equipos que no pueden sacar sus esquemas propietarios fuera de su red. Soporta function calling nativo para agentes de código como OpenHands, OpenCode y VS Code, y se distribuye tanto en safetensors BF16 como en cuantizaciones GGUF Q8_0 y Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 (`Mistral3ForConditionalGeneration`): decodificador de texto ministral3 de 40 capas + torre de visión pixtral de 24 capas; GQA 4:1 con 8 cabezas KV |
| Parametros totales | 24.011.361.280 (24,0 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Hasta 384K máximo; 32.768 tokens recomendados para código y bucles de agente |
| Tipos de cuantizacion | BF16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 10 shards, 44,76 GiB) y GGUF (Q8_0 23,33 GiB; Q4_K_M 13,35 GiB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mistral3 de su base, `unsloth/Devstral-Small-2-24B-Instruct-2512`. Se trata de un transformer multimodal compuesto por un decodificador de texto ministral3 de 40 capas y una torre de visión pixtral de 24 capas, con atención de consultas agrupadas (GQA) en proporción 4:1 y 8 cabezas KV, lo que reduce el coste de memoria de la caché KV a contextos largos. El pipeline declarado en Hugging Face es `image-text-to-text`, aunque la model card describe el uso principal como generación de texto y agente de código.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de ajuste ni si se aplicaron fases de RLHF o DPO sobre la base. La model card sí detalla el objetivo del ajuste: cubrir las APIs de Frappe v15, v16 y v17, la lógica de dominio de ERPNext (libro mayor, valoración de stock y almacén, ciclos de compra y venta, BOM y fabricación, flujos de aprobación, DocTypes personalizados) y la portabilidad entre MariaDB y PostgreSQL mediante `frappe.qb` y el ORM. También menciona la compatibilidad con function calling nativo y la separación entre modo agente (con herramientas) y modo Q&A directo (sin herramientas).

## Capacidades

- Generación de código para el framework Frappe y ERPNext: controladores de ciclo de vida de documentos, hooks `doc_events`, permisos, parches de esquema, Server Scripts y tests con `FrappeTestCase`.
- Razonamiento sobre lógica de dominio ERP: contabilidad (libro mayor), valoración de stock y almacén, ciclos de compra y venta, fabricación y BOM, flujos de aprobación.
- Generación de consultas portables con `frappe.qb` y el ORM, respetando diferencias entre MariaDB y PostgreSQL.
- Soporte de tool calling / function calling nativo, compatible con agentes como OpenHands, OpenCode y VS Code.
- Capacidades de agente y razonamiento multi-paso en bucles de codificación.
- Capacidades multimodales de entrada (imagen-texto a texto) heredadas de la arquitectura Mistral3, si bien el foco declarado es el código.
- Modo Q&A directo sin herramientas, orientado a respuestas fundamentadas.

## Casos de uso

- Desarrollo de módulos ERPNext a medida: el modelo genera controladores, hooks y permisos para DocTypes personalizados, evitando antipatrones como consultas N+1 o `frappe.db.commit()` dispersos, gracias a su ajuste específico sobre las APIs de Frappe.
- Migraciones entre versiones de Frappe (v15 a v16 o v17): produce parches de esquema y adapta llamadas a la API respetando los cambios entre versiones, reduciendo el trabajo manual de actualización.
- Portabilidad de bases de datos de MariaDB a PostgreSQL: genera consultas con `frappe.qb` y el ORM que respetan las diferencias de motor, lo que facilita migraciones más seguras.
- Agente de codificación integrado en el IDE: con function calling nativo y 32K tokens de contexto recomendados, se conecta a OpenHands, OpenCode o VS Code para tareas multi-paso sobre un repositorio de una aplicación Frappe.
- Generación de tests unitarios: produce casos con `FrappeTestCase` para controladores y lógica de negocio, útil en pipelines de integración continua de equipos ERP.
- Asistencia en lógica contable y de inventario: responde y genera código sobre libro mayor, valoración de stock y flujos de aprobación, un dominio donde los modelos genéricos suelen fallar.
- Despliegue autoalojado con datos sensibles: al ejecutarse en estación de trabajo, GPU de equipo o clúster privado, permite trabajar con esquemas y lógica de precios propietarios sin salir de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con contexto de 32K y un usuario concurrente:
  - Q4_K_M: aproximadamente 19,9 GiB con caché KV en FP16 y 17,4 GiB con caché KV en Q8_0.
  - Q8_0: aproximadamente 29,8 GiB con caché KV en FP16 y 27,3 GiB con caché KV en Q8_0.
  - BF16: aproximadamente 51,3 GiB con caché KV en FP16 y 48,8 GiB con caché KV en Q8_0.
- GPU recomendadas:
  - BF16: A100, H100 o RTX PRO 6000 de 80-96 GB, o 2 GPU de 48 GB con `--tensor-parallel-size 2`.
  - Q8_0: L40S, A6000 o A100 40GB (40-48 GB).
  - Q4_K_M: RTX 3090/4090, L4 o A10G (24 GB).
- Cabe en GPU de consumo: sí, con Q4_K_M en una RTX 3090 o 4090 de 24 GB. En GPU de 12 o 16 GB (RTX 3060, 4060 Ti, T4) requiere offload parcial (`-ngl 22` o `-ngl 32`) con al menos 24 GB de RAM de sistema.
- Memoria unificada en Mac: Q4_K_M en Mac Apple Silicon de 36 GB o más (M3/M4 Pro); Q8_0 en Mac de 48-64 GB o más (Max/Ultra).
- Opciones de despliegue: vLLM (BF16, con `--tokenizer-mode mistral`, `--enable-auto-tool-choice`, `--tool-call-parser mistral` y `--enable-prefix-caching`), llama.cpp / `llama-server` (GGUF, con `--jinja`), y contenedores Podman en Linux con GPU NVIDIA.
- Ajustes recomendados de inferencia: `temperature=0.15`, `min_p=0.01`, `repeat_penalty=1.05`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vyogo-Coder-v1-Devstral-24B | 24,0 B | Hasta 384K (32K recomendado) | Apache-2.0 | safetensors, GGUF | Ajuste especializado en Frappe/ERPNext |
| Devstral-Small-2-24B-Instruct-2512 (base) | 24,0 B | no disponible | no disponible | no disponible | Modelo base generalista de código y agentes |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; no hay soporte verificado de castellano ni de otros idiomas.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un ajuste sobre una base generalista, puede heredar los de esta.
- Riesgo de alucinación: la propia model card advierte que los modelos genéricos inventan flags de CLI y confunden APIs entre versiones de Frappe; el ajuste mitiga pero no elimina este riesgo, por lo que el código generado requiere revisión.
- Dominio acotado: el ajuste está orientado a Frappe y ERPNext; su rendimiento en otras tareas de código no está documentado.
- Contexto: aunque se declara hasta 384K, se recomiendan 32K para código y agentes; el uso de contextos muy largos incrementa la memoria de la caché KV.
- Configuración sensible: requiere usar la plantilla y el parser de Mistral (no ChatML ni parsers de Qwen); una configuración incorrecta degrada la calidad y rompe el tool calling.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base.
- Adopción: el modelo tiene 71 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vyogotech/Vyogo-Coder-v1-Devstral-24B
- Repositorio GGUF: https://huggingface.co/vyogotech/Vyogo-Coder-v1-Devstral-24B-GGUF
- Modelo base: https://huggingface.co/unsloth/Devstral-Small-2-24B-Instruct-2512
- Contacto del autor: dev@vyogo.tech
