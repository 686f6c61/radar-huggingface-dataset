# VachanaTTS2024/trust-wallet-metamask-seed-recovery-downlo

## Resumen

La entrada `VachanaTTS2024/trust-wallet-metamask-seed-recovery-downlo` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un paquete ejecutable para Windows distribuido como archivo ZIP, presentado bajo la apariencia de una herramienta de "recuperación de semilla" de monederos Trust Wallet y MetaMask. El autor declarado es la cuenta `VachanaTTS2024`, sin historial verificable de publicaciones de modelos, y la model card no contiene ninguna descripción de arquitectura, pesos, dataset o proceso de entrenamiento.

El texto de la model card mezcla terminología de monederos de criptomonedas (BIP39, BIP44/BIP84, derivación multicadena EVM/Solana/BTC, rotación de RPC) con referencias a un ejecutable llamado `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, un nombre que no guarda relación alguna con el supuesto propósito de recuperación de semillas. El paquete se distribuye con contraseña de descompresión (`2026`) y se solicita su ejecución "como administrador", un patrón habitual en campañas de distribución de software malicioso.

Desde el punto de vista técnico, no existe ningún artefacto de IA que evaluar: no hay ficheros de pesos, no hay tokenizador, no hay pipeline declarado y el repositorio no contiene información sobre parámetros, contexto o licencia de modelo más allá de una etiqueta MIT genérica. Esta ficha documenta la entrada por rigor y advierte de que su uso conlleva riesgos de seguridad graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio contiene un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; no verificable) |
| Licencia | MIT (etiqueta declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` de Windows (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO u otras). El repositorio no contiene ficheros de pesos en formatos habituales (safetensors, GGUF, PyTorch binario) ni configuraciones de modelo.

El contenido descrito en la model card corresponde a un binario Windows de 4,8 MB empaquetado en un ZIP protegido con contraseña, junto con instrucciones para ejecutarlo con privilegios de administrador. La discrepancia entre el nombre del ejecutable (un supuesto macro para un juego) y el propósito declarado (recuperación de semillas de monederos) es una señal de alerta clara de ingeniería social.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay evidencias de capacidades multilingües reales; la lista de idiomas en los metadatos no está respaldada por ningún artefacto de modelo.
- La model card atribuye al binario funciones de validación BIP39, derivación BIP44/BIP84, auditoría de tokens ERC20/SPL y "resolución de mnemónicos parciales", sin ninguna verificación independiente.

## Casos de uso

- No se identifican casos de uso legítimos de IA para esta entrada, ya que no contiene un modelo.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier otra consideración.
- Documentación de amenazas: usar la entrada como ejemplo de repositorio señuelo en formación sobre seguridad de la cadena de suministro de software.
- Investigación de fraude: estudiar el patrón de nombres (suplantación de marcas de monederos) para mejorar sistemas de detección de repositorios maliciosos.
- Monitorización de plataformas: incluir este tipo de entradas en listas de denuncia para su retirada de Hugging Face.
- No se recomienda su uso para recuperación de semillas, gestión de activos ni ninguna tarea relacionada con criptomonedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar, por lo que no existe requisito de VRAM ni de GPU.
- El único artefacto es un ejecutable de Windows de 4,8 MB que, según la model card, requiere Windows 10 o Windows 11 de 64 bits.
- No procede hablar de A100, H100, RTX 4090 ni de despliegue con vLLM, llama.cpp, Ollama o TGI.
- No hay datos de latencia ni de throughput porque no hay inferencia de modelo.
- Cualquier ejecución del binario debería hacerse exclusivamente en una máquina virtual desechable y sin acceso a red ni a secretos.

## Comparativa con modelos similares

| Entrada | Tipo de artefacto | Parametros | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `VachanaTTS2024/trust-wallet-metamask-seed-recovery-downlo` | ZIP con `.exe` de Windows | no disponible | no disponible | MIT (declarada) | Alto: ejecutable con contraseña y petición de privilegios de administrador |
| Modelo de IA open source típico en Hugging Face | Pesos safetensors/GGUF + config | Documentados | Documentado | Apache-2.0, MIT, Llama, etc. | Bajo o medio según uso |
| Repositorio de utilidades de monederos legítimo (p. ej., librerías BIP39 en Python/JS) | Código fuente auditable | No aplica | No aplica | MIT/Apache-2.0 | Bajo, si el código es verificable |

No se dispone de modelos comparables de la misma categoría porque la entrada no pertenece a ninguna categoría de modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración ni pipeline; no puede ejecutar inferencia.
- El binario se distribuye comprimido con contraseña y se pide ejecutarlo como administrador, un patrón asociado a la distribución de malware.
- El nombre del ejecutable (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) no coincide con el propósito declarado, lo que sugiere suplantación o reutilización fraudulenta de un paquete ajeno.
- La temática (recuperación de semillas de monederos) es un señuelo clásico para robar frases semilla; ningún software legítimo necesita la semilla para "recuperar" fondos.
- La licencia MIT declarada no otorga ninguna garantía sobre el contenido ni exime de responsabilidad al usuario que ejecute el binario.
- Los metadatos de idiomas y descargas (0 descargas, 0 likes) no están respaldados por artefactos verificables.
- Riesgo de alucinación y sesgos: no evaluable, al no existir modelo.
- No debe integrarse en producción ni en pipelines de CI/CD bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VachanaTTS2024/trust-wallet-metamask-seed-recovery-downlo
- URL de descarga citada en la model card (no verificar ni ejecutar): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/sebastiens6522/trust-wallet-metamask-seed-recovery-download/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios de código asociados a un modelo de IA en la información disponible.
