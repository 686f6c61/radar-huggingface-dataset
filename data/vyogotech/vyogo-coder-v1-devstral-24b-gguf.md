# vyogotech/Vyogo-Coder-v1-Devstral-24B-GGUF

## Resumen

Vyogo-Coder-v1-Devstral-24B-GGUF es la distribucion en formato GGUF del modelo Vyogo-Coder-v1-Devstral-24B, un LLM de pesos abiertos desarrollado por Vyogo Technologies y especializado en el framework Frappe (versiones 15 a 17), flujos de trabajo de ERPNext y ingenieria sobre MariaDB y PostgreSQL. El modelo parte de `unsloth/Devstral-Small-2-24B-Instruct-2512` y se ha afinado para actuar como agente de codigo en el dominio empresarial de Frappe, con una plantilla de chat consciente de herramientas (tool-aware) integrada en ambos artefactos GGUF.

Tecnicamente es un transformer denso de 23.572.403.200 parametros (aproximadamente 24B), con licencia Apache-2.0 y soporte declarado unicamente para ingles. El repositorio GGUF ofrece dos cuantizaciones listas para ejecutar: Q4_K_M (13,35 GiB) y Q8_0 (23,33 GiB), pensadas para despliegue local privado en estaciones de trabajo, Mac con Apple Silicon o servidores Linux, sin coste por token de API.

Su relevancia actual reside en la verticalidad: frente a modelos de codigo generalistas, Vyogo-Coder incorpora conocimiento especifico de Frappe/ERPNext y garantiza que el chat plano no filtre marcado de herramientas, algo critico cuando se conectan agentes como OpenHands, OpenCode o VS Code a un endpoint compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Devstral-Small-2-24B-Instruct-2512) |
| Parametros totales | 23.572.403.200 (~24B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens documentados en los comandos de referencia; 64K en configuraciones Mac de 48-64+ GB |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); BF16 en el repo base |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 24B parametros construido sobre `unsloth/Devstral-Small-2-24B-Instruct-2512`, un modelo de la familia Devstral orientado a tareas de agente de codigo. Vyogo Technologies ha realizado un ajuste fino adicional sobre ese punto de partida, excluyendo repositorios privados o de clientes, para especializarlo en Frappe Framework, ERPNext y trabajo con bases de datos MariaDB y PostgreSQL. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion destacable es la integracion de una plantilla de chat consciente de herramientas en ambos artefactos GGUF: los agentes de codigo funcionan correctamente con tool calling nativo, mientras que el chat conversacional plano no emite marcado de herramientas espurio. El autor reporta 0 tokens de herramienta filtrados en chat plano sobre 40 pruebas de conversacion y abstencion. Los pesos se distribuyen verificables mediante SHA256SUMS.txt, con soporte para decodificacion con atencion flash (`-fa on`) y cache KV cuantizada en Q8_0.

## Capacidades

- Generacion de codigo especializada en Frappe Framework (v15-v17) y ERPNext.
- Ingenieria de esquemas y consultas sobre MariaDB y PostgreSQL.
- Tool calling / function calling nativo, con plantilla de chat integrada en los GGUF.
- Soporte para agentes de codigo multi-paso (OpenHands, OpenCode, VS Code) via endpoint compatible con la API de OpenAI.
- Automatizacion de CLI y tareas de esquema no vistas previamente.
- Razonamiento de codigo Python y SQL en modalidad closed-book.
- Capacidad de abstencion y fiabilidad conversacional (no inventar cuando no sabe).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Desarrollo de aplicaciones Frappe: el modelo puede generar DocTypes, controladores y hooks (`doc_events`) para Frappe v15-v17, aprovechando su ajuste especifico en el framework y reduciendo errores de API frente a modelos generalistas.
- Personalizacion de ERPNext: generacion y modificacion de scripts de cliente, server scripts y reportes personalizados sobre el dominio ERPNext, con conocimiento de las convenciones del ecosistema.
- Migraciones y consultas de base de datos: redaccion de SQL para MariaDB y PostgreSQL, incluyendo optimizacion de consultas y definicion de esquemas, gracias a su entrenamiento en ingenieria de bases de datos.
- Agente de codigo autonomo en IDE: integracion con OpenCode o VS Code apuntando a `http://localhost:8080/v1` con `native_tool_calling = true`, permitiendo edicion multi-archivo y ejecucion de herramientas dentro del editor.
- Despliegue privado en estacion de trabajo: ejecucion con llama.cpp sobre una RTX 3090/4090 de 24 GB en cuantizacion Q4_K_M a 32K de contexto, manteniendo esquemas y codigo propietario sin salir de la infraestructura local.
- Servidor Linux sin GPU: ejecucion en CPU pura con 48-64 GB de RAM y cache KV en Q8_0, adecuada para equipos con politicas estrictas de soberania de datos.
- Asistencia interna para desarrolladores Frappe: endpoint compatible con OpenAI para consultas sobre setup, foro de desarrolladores y patrones del framework, con capacidad de abstencion verificada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre pesos crudos sin asistencia, a temperatura 0:

| Prueba | Resultado |
|---|---|
| Smoke checks GGUF (Q4_K_M y Q8_0) | 8 / 8 |
| Frappe Framework, setup y foro de desarrolladores (interno) | 93,1% (228 / 245); 93,5% (229 / 245) con herramientas de lookup |
| Fiabilidad conversacional y abstencion | 92,5% (37 / 40); 0 tokens de herramienta filtrados en chat plano |
| Automatizacion CLI y esquema no vistos | 80,0% (8 / 10) |
| Codigo Frappe Python/SQL closed-book | 66,7% (12 / 18) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (Q4_K_M, 32K contexto): ~19,9 GiB; ~17,4 GiB con cache KV en Q8_0.
- VRAM estimada (Q8_0, 32K contexto): ~29,8 GiB; ~27,3 GiB con cache KV en Q8_0.
- GPU recomendadas para Q8_0: L40S, RTX A6000 / 6000 Ada o A100 40GB (40-48 GB de VRAM).
- GPU recomendadas para Q4_K_M: RTX 3090, RTX 4090, L4 o A10G (24 GB de VRAM).
- Cabe en consumer GPU: si, en RTX 3090/4090 de 24 GB con Q4_K_M a 32K contexto; en GPUs de 12-16 GB (RTX 3060, 4060 Ti, T4) solo con offload parcial (`--n-gpu-layers 22` o `32`) y al menos 24 GB de RAM de sistema.
- Apple Silicon: 36 GB (M3/M4 Pro) para Q4_K_M a 32K; 48-64+ GB (Max/Ultra) para Q8_0 a 32K o 64K de contexto; 24 GB Mac con contexto reducido a 8K-16K y cache KV en Q8_0.
- CPU pura: servidor Linux con 48-64 GB de RAM recomendados, `--threads` ajustado a nucleos fisicos.
- Opciones de despliegue: llama.cpp (nativo en macOS via Homebrew, contenedor CUDA o CPU via Podman/ghcr.io), BF16 en vLLM desde el repo base; endpoint compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Vyogo-Coder-v1-Devstral-24B | ~24B | 32K (64K en configuraciones de 48-64+ GB) | Apache-2.0 | Frappe, ERPNext, MariaDB/PostgreSQL | GGUF y BF16 en Hugging Face |
| Devstral-Small-2-24B-Instruct-2512 | ~24B | no disponible | no disponible | Agente de codigo generalista | Hugging Face (modelo base) |
| Modelos de codigo generalistas de ~24B | no disponible | no disponible | no disponible | Codigo general | no disponible |

La comparacion con alternativas generalistas de la misma categoria no puede cuantificarse porque no se han publicado benchmarks estandar en la informacion disponible.

## Limitaciones y advertencias

- Idioma: la model card declara soporte unicamente en ingles; el rendimiento en castellano u otros idiomas no esta validado.
- Especializacion estrecha: el ajuste fino se centra en Frappe/ERPNext y bases de datos; fuera de ese dominio puede rendir por debajo de modelos de codigo generalistas.
- Alucinacion: aunque se reporta capacidad de abstencion (92,5% en pruebas internas), persiste el riesgo de generar APIs o esquemas inexistentes, especialmente en codigo closed-book (66,7% en la prueba correspondiente).
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.
- Contexto: el limite documentado en los comandos de referencia es de 32K tokens; superarlo requiere configuraciones de hardware especificas y no esta garantizado su rendimiento.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye como release independiente no afiliado ni respaldado por Frappe Technologies; Frappe y ERPNext son marcas registradas de Frappe Technologies Pvt. Ltd.
- Produccion: los benchmarks son internos y no auditados externamente; conviene validar en el dominio propio antes de desplegar en flujos criticos.
- Fecha de creacion del repositorio: 2026-11-22, con solo 199 descargas y 1 like en el momento de la consulta, lo que indica una adopcion todavia muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vyogotech/Vyogo-Coder-v1-Devstral-24B-GGUF
- Modelo base BF16: https://huggingface.co/vyogotech/Vyogo-Coder-v1-Devstral-24B
- Modelo de partida: https://huggingface.co/unsloth/Devstral-Small-2-24B-Instruct-2512
- Contacto de soporte: dev@vyogo.tech
- llama.cpp (contenedor oficial): https://ghcr.io/ggml-org/llama.cpp
