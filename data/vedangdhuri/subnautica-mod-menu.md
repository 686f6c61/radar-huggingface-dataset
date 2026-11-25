# vedangdhuri/subnautica-mod-menu

## Resumen

El artefacto publicado bajo el identificador `vedangdhuri/subnautica-mod-menu` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete binario para Windows x64 distribuido a través de Hugging Face que, según su propia model card, contiene un ejecutable denominado `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, presentado como una herramienta de tipo "mod menu" para el videojuego Subnautica. El repositorio no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo entrenado.

La model card describe funcionalidades de trampas en videojuegos (ESP, aimbot, overlay externo, radar 2D, filtro de loot y una tecla de pánico para descargar el proceso), además de instrucciones para descargar un ZIP de 4,8 MB alojado en un repositorio de GitHub de terceros, extraerlo con la contraseña `2026` y ejecutarlo como administrador. El identificador del repositorio, el nombre del ejecutable y las rutas de descarga no son coherentes entre sí (se mezclan referencias a Subnautica y a Deadlock), lo que es una señal clara de empaquetado sospechoso.

Desde el punto de vista de evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de IA porque no existen. El contenido es relevante únicamente como caso de estudio de riesgo en plataformas de distribución de artefactos: repositorios que suplantan la categoría de "modelo" para distribuir binarios opacos con instrucciones de ejecución como administrador. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no del modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo para Windows x64 (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v1.2.4 (D50384)` según la model card), empaquetado en un ZIP de 4,8 MB protegido con contraseña. La model card menciona componentes como "user-mode external core", "Desktop Duplication rendering", polling a 463 Hz, 16 hilos de trabajo y un consumo declarado inferior a 29 MB de RAM, pero no aporta código fuente, hashes verificables ni documentación técnica auditable.

No hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni ninguna innovación de modelado. Tampoco hay evidencia de que el binario se corresponda con lo que declara la model card: la discrepancia entre el nombre del proyecto (Subnautica) y el del ejecutable (Deadlock) impide atribuirle ninguna funcionalidad concreta de forma fiable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de procesamiento de lenguaje; los idiomas listados son metadatos del repositorio.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad cognitiva.
- El binario, según su propia descripción, implementaría funciones de trampa en videojuegos (ESP, aimbot, overlay, radar), extremo que no se ha verificado y que no constituye una capacidad de IA.

## Casos de uso

- No procede. Este repositorio no es adecuado para ningún caso de uso de IA, generación de texto, código, visión ni automatización de procesos.
- Auditoría de seguridad defensiva: el artefacto puede utilizarse como muestra de estudio en un entorno aislado para analizar patrones de distribución maliciosa en plataformas de modelos (nombres incoherentes, contraseñas en el ZIP para evadir escáneres, instrucciones de ejecución como administrador, enlaces a repositorios de GitHub de terceros).
- Formación en higiene de cadena de suministro: sirve como ejemplo didáctico de por qué conviene verificar hashes, autoría y coherencia entre metadatos y contenido antes de ejecutar binarios descargados de un hub de modelos.
- Monitorización de repositorios: puede alimentar reglas de detección que marquen repositorios etiquetados como modelos pero sin pesos ni configuración, especialmente si incluyen `.exe` o contraseñas de descompresión.
- Investigación de abusos en plataformas: documentar cómo se reutilizan etiquetas de licencia permisiva (MIT) para dar apariencia de legitimidad a binarios opacos.
- Concienciación de usuarios finales: mostrar por qué "descargas" y "valoraciones" autoafirmadas en una model card no son indicadores fiables de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo evaluable. Las cifras que aparecen en la model card (descargas, valoración 4,8/5, latencia inferior a 35 ms, consistencia del 97,4 %, polling a 463 Hz) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 sobre procesadores x64 Intel y AMD.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito operativo declarado: ejecución como administrador y desactivación o excepción en Windows Defender/SmartScreen, lo que incrementa el riesgo de seguridad.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real de la plataforma, las diferencias son categóricas: ausencia de pesos, de tokenizador, de arquitectura y de licencia aplicable al contenido binario.

| Criterio | Este repositorio | Modelo de lenguaje típico en Hugging Face |
|---|---|---|
| Tipo de artefacto | ZIP con `.exe` para Windows | Pesos en safetensors/GGUF + config |
| Arquitectura | no disponible | Transformer/MoE documentada |
| Evaluable con benchmarks | No | Sí |
| Código y datos auditables | No | Habitualmente sí |
| Riesgo de ejecución | Alto (binario opaco como administrador) | Bajo (inferencia en sandbox) |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código queda fuera de su naturaleza.
- Incoherencia interna grave: el repositorio se llama `subnautica-mod-menu`, pero el ejecutable y los enlaces apuntan a `deadlock-cheat-esp-aimbot-2026`, lo que sugiere suplantación o reempaquetado.
- Distribución mediante ZIP con contraseña (`2026`) y enlaces a repositorios de GitHub de terceros: técnica habitual para evadir análisis automatizados.
- Instrucciones explícitas de ejecutar como administrador y de añadir exclusiones en Windows Defender/SmartScreen: incrementan la superficie de ataque del sistema.
- Licencia MIT declarada en metadatos, pero sin correspondencia clara con el contenido binario; no debe interpretarse como garantía de seguridad ni de legalidad del binario.
- Riesgo legal y de términos de servicio: las herramientas de trampa en videojuegos pueden vulnerar los ToS de las plataformas y la legislación aplicable en algunas jurisdicciones.
- Riesgo de malware: un ejecutable opaco de origen no verificado, con privilegios elevados, es un vector clásico de infección; no se recomienda su descarga ni ejecución en ningún sistema de producción o personal.
- Cero descargas y cero "likes" en el momento de la consulta, frente a las cifras infladas que declara la propia model card: indicio de falta de tracción real y de posible contenido generado para atraer clics.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vedangdhuri/subnautica-mod-menu
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/MomokaRangel/subnautica-mod-menu/releases/latest
- Paper, blog, demo o documentación técnica: no disponible.
